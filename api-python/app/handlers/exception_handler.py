from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.utils.http_exceptions import ApiException


def add_app_exception_handler(app: FastAPI) -> None:
  @app.exception_handler(ApiException)
  async def api_exception_handler(request: Request, exc: ApiException):
      return JSONResponse(
          status_code=exc.status_code,
          content={"message": exc.message},
      )
