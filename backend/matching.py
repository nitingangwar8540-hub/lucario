from operator import ge, gt, le, lt

from .models import (
    Criterion,
    CriterionResult,
    EqualityCriterion,
    ManualCriterion,
    MatchResult,
    MembershipCriterion,
    Scalar,
    Scholarship,
    StudentProfile,
)


comparisons = {"lt": lt, "lte": le, "gt": gt, "gte": ge}
status_priority = {"pass": 0, "manual_review": 1, "needs_information": 2, "fail": 3}


def evaluate_criterion(criterion: Criterion, profile: dict[str, Scalar]) -> CriterionResult:
    if isinstance(criterion, ManualCriterion):
        return CriterionResult(status="manual_review", sourceText=criterion.sourceText)

    actual = profile.get(criterion.field)
    if actual is None or (isinstance(actual, str) and not actual.strip()):
        status = "unknown"
    elif isinstance(criterion, EqualityCriterion):
        expected = criterion.value
        comparable = type(actual) is type(expected) or (
            type(actual) in (int, float) and type(expected) in (int, float)
        )
        status = "unknown" if not comparable else ("pass" if actual == expected else "fail")
    elif isinstance(criterion, MembershipCriterion):
        status = "unknown" if not isinstance(actual, str) else (
            "pass" if actual in criterion.value else "fail"
        )
    elif type(actual) not in (int, float):
        status = "unknown"
    else:
        status = "pass" if comparisons[criterion.operator](actual, criterion.value) else "fail"

    return CriterionResult(field=criterion.field, status=status, sourceText=criterion.sourceText)


def match_profile(records: list[Scholarship], profile: StudentProfile) -> list[MatchResult]:
    values = profile.model_dump(exclude_none=True)
    results = []

    for scholarship in records:
        criteria = [
            evaluate_criterion(criterion, values)
            for criterion in scholarship.eligibilityCriteria
        ]
        statuses = {criterion.status for criterion in criteria}

        if "fail" in statuses:
            status = "fail"
        elif "unknown" in statuses:
            status = "needs_information"
        elif "manual_review" in statuses:
            status = "manual_review"
        else:
            status = "pass"

        results.append(MatchResult(scholarship=scholarship, status=status, criteria=criteria))

    return sorted(
        results,
        key=lambda result: (result.scholarship.isHistorical, status_priority[result.status]),
    )
