import re
from pathlib import Path

from pydantic import TypeAdapter, ValidationError

from .models import CatalogRecord, Portal, Scholarship


catalog_adapter = TypeAdapter(list[CatalogRecord])


class CatalogUnavailable(Exception):
    pass


def load_catalog(path: Path, active_cycle_start: int) -> list[Scholarship]:
    try:
        records = catalog_adapter.validate_json(path.read_bytes())
    except (OSError, ValidationError) as error:
        raise CatalogUnavailable from error

    if len({record.id for record in records}) != len(records):
        raise CatalogUnavailable

    return [
        Scholarship(
            **record.model_dump(),
            isHistorical=is_historical(record.applicationCycle, active_cycle_start),
        )
        for record in records
    ]


def is_historical(cycle: str | None, active_cycle_start: int) -> bool:
    match = re.fullmatch(r"(\d{4})\s*[-–]\s*(\d{2}|\d{4})", cycle.strip()) if cycle else None
    return match is not None and int(match.group(1)) < active_cycle_start


def search_catalog(
    records: list[Scholarship], q: str | None = None, portal: Portal | None = None
) -> list[Scholarship]:
    terms = q.casefold().split() if q else []
    results = []

    for record in records:
        if portal is not None and record.portal != portal:
            continue
        searchable_text = f"{record.name} {record.id.replace('-', ' ')}".casefold()
        if all(term in searchable_text for term in terms):
            results.append(record)

    return results
