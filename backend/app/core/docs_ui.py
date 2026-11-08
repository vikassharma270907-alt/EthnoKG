from pathlib import Path
from fastapi.responses import HTMLResponse

TEMPLATE_PATH = Path(__file__).resolve().parent.parent / "templates" / "docs.html"

def get_custom_docs_html(
    openapi_url: str = "/openapi.json",
    title: str = "EthnoKG API Documentation — EthnoHack 2026",
    version: str = "1.0.0"
) -> HTMLResponse:
    """
    Renders the modern, dark & grey themed interactive API documentation portal.
    Features:
      - Custom dark/slate grey palette with cyber & botanical neon accents
      - Interactive particle constellation canvas
      - Live latency probe & waveform monitor
      - Real-time client-side endpoint search and HTTP method filtering
      - Tag/Namespace quick-navigation pill bar
      - Deep CSS restyling of Swagger UI 5.x DOM elements
    """
    if not TEMPLATE_PATH.exists():
        # Fallback if template is somehow missing
        return HTMLResponse(
            content=f"<html><head><title>{title}</title></head><body><h1>{title}</h1><p>OpenAPI spec at <a href='{openapi_url}'>{openapi_url}</a></p></body></html>",
            status_code=200
        )

    html_content = TEMPLATE_PATH.read_text(encoding="utf-8")
    html_content = html_content.replace("{{ title }}", title)
    html_content = html_content.replace("{{ openapi_url }}", openapi_url)
    html_content = html_content.replace("{{ version }}", version)

    return HTMLResponse(content=html_content, status_code=200)
