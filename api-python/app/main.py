from fastapi import FastAPI
from .routers import auth, documents, websocket
from typing import List


app = FastAPI()


app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(websocket.router)


@app.get("/")
async def root():
    return {"message": "MarkdownEditor API is working."}
