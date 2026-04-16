import os
import tempfile
from datetime import datetime
from typing import Dict, Optional

import boto3
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.core.config import get_settings
from app.core.tenancy import scope_by_restaurant
from app.db.mongo import get_invoices_collection
from app.services.order_service import get_order


def _invoice_number(order_id: str) -> str:
    stamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"INV-{order_id[-6:]}-{stamp}"


def _render_invoice_pdf(path: str, order: Dict, invoice_number: str) -> None:
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter
    y = height - 40

    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, y, "ServeX Invoice")
    y -= 24

    c.setFont("Helvetica", 10)
    c.drawString(40, y, f"Invoice: {invoice_number}")
    y -= 14
    c.drawString(40, y, f"Order ID: {order['_id']}")
    y -= 14
    c.drawString(40, y, f"Date: {datetime.utcnow().isoformat()}")
    y -= 24

    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "Item")
    c.drawString(280, y, "Qty")
    c.drawString(330, y, "Unit")
    c.drawString(400, y, "Total")
    y -= 12
    c.line(40, y, width - 40, y)
    y -= 16

    c.setFont("Helvetica", 10)
    for item in order.get("items", []):
        c.drawString(40, y, item["name"])
        c.drawString(280, y, str(item["quantity"]))
        c.drawString(330, y, f"{item['unit_price']:.2f}")
        c.drawString(400, y, f"{item['total']:.2f}")
        y -= 16
        if y < 80:
            c.showPage()
            y = height - 40

    y -= 8
    c.line(40, y, width - 40, y)
    y -= 18

    c.drawString(330, y, "Subtotal")
    c.drawString(400, y, f"{order['subtotal']:.2f}")
    y -= 14
    c.drawString(330, y, "Tax")
    c.drawString(400, y, f"{order['tax']:.2f}")
    y -= 14
    c.setFont("Helvetica-Bold", 11)
    c.drawString(330, y, "Total")
    c.drawString(400, y, f"{order['total']:.2f} {order.get('currency', 'INR')}")

    c.showPage()
    c.save()


def _store_local(order_id: str, pdf_path: str) -> Dict:
    settings = get_settings()
    os.makedirs(settings.invoice_local_dir, exist_ok=True)
    filename = f"{order_id}.pdf"
    dest_path = os.path.join(settings.invoice_local_dir, filename)
    os.replace(pdf_path, dest_path)
    return {"file_path": dest_path, "file_url": None}


def _store_s3(order_id: str, pdf_path: str) -> Dict:
    settings = get_settings()
    if not settings.s3_bucket:
        raise RuntimeError("S3 bucket is not configured")

    client = boto3.client(
        "s3",
        region_name=settings.s3_region or None,
        aws_access_key_id=settings.s3_access_key or None,
        aws_secret_access_key=settings.s3_secret_key or None,
        endpoint_url=settings.s3_endpoint_url or None,
    )
    key = f"invoices/{order_id}.pdf"
    client.upload_file(pdf_path, settings.s3_bucket, key, ExtraArgs={"ContentType": "application/pdf"})

    try:
        os.remove(pdf_path)
    except OSError:
        pass

    file_url = f"s3://{settings.s3_bucket}/{key}"
    return {"file_path": None, "file_url": file_url}


async def create_or_get_invoice(restaurant_id: str, order_id: str) -> Dict:
    collection = get_invoices_collection()
    existing = await collection.find_one(
        scope_by_restaurant({"order_id": order_id}, restaurant_id)
    )
    if existing:
        return existing

    order = await get_order(restaurant_id, order_id)
    if not order:
        raise ValueError("Order not found")

    invoice_number = _invoice_number(order_id)
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = tmp.name

    _render_invoice_pdf(tmp_path, order, invoice_number)

    settings = get_settings()
    if settings.invoice_storage_backend == "s3":
        storage = _store_s3(order_id, tmp_path)
    else:
        storage = _store_local(order_id, tmp_path)

    doc = {
        "restaurant_id": restaurant_id,
        "order_id": order_id,
        "invoice_number": invoice_number,
        "subtotal": order["subtotal"],
        "tax": order["tax"],
        "total": order["total"],
        "currency": order.get("currency", settings.currency),
        "storage_backend": settings.invoice_storage_backend,
        "file_path": storage.get("file_path"),
        "file_url": storage.get("file_url"),
        "created_at": datetime.utcnow(),
    }
    result = await collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc
