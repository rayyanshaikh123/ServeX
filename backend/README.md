# ServeX Backend

Production-grade, local-first AI backend for a restaurant assistant using FastAPI, MongoDB Atlas vector search, LangChain, and Ollama.

## Features
- Async FastAPI backend with streaming responses
- Atlas Vector Search retrieval over menu items
- SentenceTransformers embeddings with caching
- LangChain + Ollama RAG orchestration
- Simple in-memory session memory

## Setup
1. Create a virtual environment and install dependencies:
   - `python -m venv .venv`
   - `pip install -r requirements.txt`

2. Copy the environment template:
   - `cp .env.example .env`
   - Fill in MongoDB Atlas and Ollama settings

3. Create an Atlas Vector Search index for the menu collection.
   Example index definition:

```
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

4. Seed sample menu items and generate embeddings:
   - `python scripts/generate_embeddings.py --seed`
   - Optional: `python scripts/generate_embeddings.py --seed --restaurant-id your-restaurant-id`

5. Start the API:
   - `uvicorn app.main:app --reload`

## API
### POST /api/chat
Request body:
```
{
  "query": "string",
  "session_id": "string"
}
```

Response:
- Streaming text tokens (plain text)

### Orders
- `POST /api/orders` create order
- `POST /api/orders/{id}/status` update status
- `POST /api/orders/{id}/invoice` generate invoice

### Payments
- `POST /api/payments/order` create Razorpay order
- `POST /api/payments/verify` verify payment
- `POST /api/payments/webhook` Razorpay webhook

### Analytics
- `GET /api/analytics/summary`

### WebSocket
Connect with an access token:
`/ws/restaurant/{restaurant_id}?token=ACCESS_TOKEN`

## Development Phases
1. Bootstrap project scaffolding, config, and logging
2. Implement MongoDB data layer and menu models
3. Build embeddings + seeding pipeline with caching
4. Add vector search retrieval with filters
5. Implement RAG prompt + Ollama streaming
6. Add API endpoint and session memory
7. Harden validation, timeouts, and error handling

## Notes
- Ensure the embedding dimension in the index matches the embedding model.
- Default model is `llama3`; override via `LLM_MODEL` in `.env`.
- Multi-tenant data should include `restaurant_id` on each menu item.
