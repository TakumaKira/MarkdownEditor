from fastapi import FastAPI

from .routers import auth, documents, websocket
from app.handlers.exception_handler import add_app_exception_handler


# TODO: Add check_envs function.

app = FastAPI()

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(websocket.router)

add_app_exception_handler(app)


@app.get("/")
async def root():
    return {"message": "MarkdownEditor API is working."}
