from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.utils.http_exceptions import ApiException


def add_app_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(ApiException)
    async def api_exception_handler(request: Request, exc: ApiException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"message": exc.message},
        )


def add_validation_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        messages = []
        for error in exc.errors():
            type = error["type"]
            if type == "assertion_error":
                messages.append(error["msg"])
            elif type == "value_error.email":
                messages.append(f"{error['loc'][1]} is not a valid email address")
            elif type == "value_error.any_str.min_length":
                messages.append(f"ensure {error['loc'][1]} has at least {error['ctx']['limit_value']} characters")
            else:
                messages.append(f"{error['loc'][1]} has following error: {error['msg']}")
        message = " / ".join(messages)
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"message": message},
        )
