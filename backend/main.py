import os
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .catalog import CatalogUnavailable, load_catalog, search_catalog
from .matching import match_profile
from .models import MatchRequest, MatchResult, Portal, Scholarship


default_catalog = Path(__file__).resolve().parents[1] / "data" / "catalog" / "scholarships.json"
default_origins = "http://127.0.0.1:5173,http://localhost:5173"


def create_app(
    catalog_path: Path | None = None, active_cycle_start: int | None = None
) -> FastAPI:
    if catalog_path is None:
        catalog_path = Path(os.environ.get("SCHOLARSHIP_CATALOG_PATH", default_catalog))
    if active_cycle_start is None:
        active_cycle_start = int(os.environ.get("SCHOLARSHIP_ACTIVE_CYCLE_START", "2026"))

    app = FastAPI(title="ScholarSaarthi Matching API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            origin.strip()
            for origin in os.environ.get("SCHOLARSHIP_WEB_ORIGINS", default_origins).split(",")
            if origin.strip()
        ],
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    def current_catalog() -> list[Scholarship]:
        try:
            return load_catalog(catalog_path, active_cycle_start)
        except CatalogUnavailable:
            raise HTTPException(
                status_code=503,
                detail={"code": "catalog_unavailable", "message": "Scholarship catalog is unavailable."},
            ) from None

    @app.get("/api/scholarships", response_model=list[Scholarship])
    def get_scholarships(
        q: Annotated[str | None, Query(max_length=120)] = None,
        portal: Portal | None = None,
    ) -> list[Scholarship]:
        return search_catalog(current_catalog(), q, portal)

    @app.get("/api/scholarships/{scheme_id}", response_model=Scholarship)
    def get_scholarship(scheme_id: str) -> Scholarship:
        for scholarship in current_catalog():
            if scholarship.id == scheme_id:
                return scholarship
        raise HTTPException(
            status_code=404,
            detail={"code": "scheme_not_found", "message": "Scholarship could not be found."},
        )

    @app.post("/api/matches", response_model=list[MatchResult])
    def post_matches(request: MatchRequest) -> list[MatchResult]:
        records = search_catalog(current_catalog(), request.q, request.portal)
        return match_profile(records, request.profile)

    return app


app = create_app()
