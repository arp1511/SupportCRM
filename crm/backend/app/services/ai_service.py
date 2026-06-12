import logging
from enum import StrEnum
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai.errors import APIError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import get_settings
from app.core.errors import ServiceError

logger = logging.getLogger(__name__)
settings = get_settings()


class TicketCategoryEnum(StrEnum):
    technical = "Technical Issue"
    billing = "Billing"
    feature_request = "Feature Request"
    account_issue = "Account Issue"
    bug_report = "Bug Report"


# Pydantic formats Gemini's output into strict schemas
class TicketCategoryResponse(BaseModel):
    category: TicketCategoryEnum


class TicketSummaryResponse(BaseModel):
    summary: str = Field(..., description="A short summary of the issue (1 or 2 sentences max).")
    root_cause: str = Field(..., description="The likely underlying reason or component causing the issue.")
    suggested_action: str = Field(..., description="Recommended immediate action for the agent.")


def get_genai_client() -> genai.Client:
    """
    Instantiates the Gemini client. We strip empty strings to avoid 
    passing dummy values to the SDK, letting it fallback to reading the 
    standard GEMINI_API_KEY environment variable.
    """
    api_key = settings.gemini_api_key.strip() if settings.gemini_api_key else ""
    if not api_key:
        return genai.Client()
    return genai.Client(api_key=api_key)


# LLM APIs can sometimes return rate limit errors or drop requests, 
# so we use tenacity for retrying with exponential backoff.
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=6),
    retry=retry_if_exception_type((APIError, TimeoutError)),
    reraise=True
)
def call_gemini_api(
    prompt: str
) -> str:
    try:
        client = get_genai_client()
        # 2.5 flash is extremely fast, cheap, and very accurate for simple structural outputs
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        if not response.text:
            raise ServiceError("Received empty text response from Gemini API")
        return response.text
    except APIError as exc:
        logger.error(f"Gemini API error during generation: {exc}")
        raise
    except Exception as exc:
        logger.error(f"Unexpected exception calling Gemini API: {exc}")
        raise


def categorize_ticket(subject: str, description: str) -> TicketCategoryResponse:
    prompt = (
        "Classify the following customer support ticket into one of the designated categories:\n"
        "Categories: Technical Issue, Billing, Feature Request, Account Issue, Bug Report\n\n"
        f"Subject: {subject}\n"
        f"Description: {description}\n\n"
        "Return a JSON object in the exact format: {\"category\": \"<Category>\"}. Choose exactly one category from the list. Return ONLY the JSON object."
    )
    
    try:
        json_text = call_gemini_api(prompt)
        clean_json = json_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()
        return TicketCategoryResponse.model_validate_json(clean_json)
    except Exception as exc:
        logger.exception("AI categorization failed")
        raise ServiceError("The categorization service is currently offline.") from exc


def summarize_ticket(subject: str, description: str) -> TicketSummaryResponse:
    prompt = (
        "Analyze this support ticket description and extract a short summary, "
        "the most probable root cause, and a clear suggested action for the support representative.\n\n"
        f"Subject: {subject}\n"
        f"Description: {description}\n\n"
        "Return a JSON object in the exact format:\n"
        "{\n"
        "  \"summary\": \"<summary>\",\n"
        "  \"root_cause\": \"<root_cause>\",\n"
        "  \"suggested_action\": \"<suggested_action>\"\n"
        "}\n\n"
        "Return ONLY the JSON object."
    )
    
    try:
        json_text = call_gemini_api(prompt)
        clean_json = json_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()
        return TicketSummaryResponse.model_validate_json(clean_json)
    except Exception as exc:
        logger.exception("AI summarization failed")
        raise ServiceError("The summarization service is currently offline.") from exc
