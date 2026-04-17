import logging

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.core.limiter import ai_limiter
from app.core.security import get_current_user, get_optional_current_user
from app.models.request import ChatRequest
from app.schemas.user import CurrentUser
from app.ai.rag_pipeline import get_rag_pipeline
from app.services.session_memory import get_session_memory

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/api/chat", dependencies=[Depends(ai_limiter())])
async def chat(
    payload: ChatRequest,
    current_user: CurrentUser | None = Depends(get_optional_current_user),
) -> StreamingResponse:
    pipeline = get_rag_pipeline()
    memory = get_session_memory()
    
    restaurant_id = current_user.restaurant_id if current_user else payload.restaurant_id
    if not restaurant_id:
        raise HTTPException(status_code=400, detail="restaurant_id is required")

    async def token_stream():
        collected = []
        try:
            async for token in pipeline.stream_response(
                payload.query, payload.session_id, restaurant_id
            ):
                collected.append(token)
                yield token
        except Exception:
            logger.exception("Chat stream failed")
            yield "\n[Error] Sorry, something went wrong."
        finally:
            if collected:
                await memory.add_turn(payload.session_id, payload.query, "".join(collected))

    return StreamingResponse(token_stream(), media_type="text/plain")
