from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError


class NotFoundError(Exception):
    """Raised when an ORM object or record is not found."""
    def __init__(self, message: str = "Resource not found") -> None:
        self.message = message


class ServiceError(Exception):
    """Raised for general service-level issues (like API failures or constraints violations)."""
    def __init__(self, message: str = "Unable to process request") -> None:
        self.message = message


def error_response(status_code: int, message: str, details: object | None = None) -> JSONResponse:
    """Helper to return consistent JSON error envelopes across all handlers."""
    payload: dict[str, object] = {"error": message}
    if details is not None:
        payload["details"] = details
    return JSONResponse(status_code=status_code, content=payload)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
        return error_response(status.HTTP_404_NOT_FOUND, exc.message)

    @app.exception_handler(ServiceError)
    async def service_error_handler(request: Request, exc: ServiceError) -> JSONResponse:
        return error_response(status.HTTP_400_BAD_REQUEST, exc.message)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        # Standard Pydantic/FastAPI validation validation errors
        return error_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Validation failed",
            exc.errors(),
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        # Security: Mask database exception details to prevent SQL structure or table details leaking
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Database error",
        )

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
        # Catch-all for unhandled exceptions to avoid leaking python stack traces to the public internet
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Internal server error",
        )
