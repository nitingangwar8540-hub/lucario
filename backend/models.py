from datetime import date
from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    StrictBool,
    StrictFloat,
    StrictInt,
    StrictStr,
    field_validator,
)


Portal = Literal["nsp", "karnataka-ssp"]
Scalar = StrictStr | StrictBool | StrictInt | StrictFloat
Percent = Annotated[float, Field(ge=0, le=100)]
Income = Annotated[int, Field(ge=0)]
Nonempty = Annotated[str, Field(min_length=1)]


class CatalogModel(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)


class AutomatedCriterion(CatalogModel):
    field: str = Field(pattern=r"^[a-z][A-Za-z0-9]*$")
    sourceText: Nonempty


class EqualityCriterion(AutomatedCriterion):
    operator: Literal["eq"]
    value: Scalar


class MembershipCriterion(AutomatedCriterion):
    operator: Literal["in"]
    value: list[Nonempty] = Field(min_length=1)


class NumericCriterion(AutomatedCriterion):
    operator: Literal["lt", "lte", "gt", "gte"]
    value: StrictInt | StrictFloat


class ManualCriterion(CatalogModel):
    operator: Literal["manual"]
    sourceText: Nonempty


Criterion = Annotated[
    EqualityCriterion | MembershipCriterion | NumericCriterion | ManualCriterion,
    Field(discriminator="operator"),
]


class Document(CatalogModel):
    name: Nonempty
    condition: Nonempty | None


class CatalogRecord(CatalogModel):
    id: str = Field(pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    name: Nonempty
    portal: Portal
    officialUrl: HttpUrl
    applicationCycle: Nonempty | None
    deadline: date | None
    eligibilityCriteria: list[Criterion] = Field(min_length=1)
    requiredDocuments: list[Document] | None
    lastCheckedDate: date | None

    @field_validator("officialUrl")
    @classmethod
    def require_https(cls, url: HttpUrl) -> HttpUrl:
        if url.scheme != "https" or url.username is not None or url.password is not None:
            raise ValueError("Use an HTTPS official URL without credentials.")
        return url


class Scholarship(CatalogRecord):
    isHistorical: bool


class StudentProfile(BaseModel):
    model_config = ConfigDict(extra="allow", strict=True, allow_inf_nan=False)
    __pydantic_extra__: dict[str, Scalar | None] = Field(init=False)

    class12BoardStreamPercentile: Percent | None = None
    annualFamilyIncomeInr: Income | None = None
    receivesOtherScholarshipOrFeeReimbursement: bool | None = None
    category: Nonempty | None = None
    nationality: Nonempty | None = None
    disabilityPercent: Percent | None = None
    annualParentalIncomeInr: Income | None = None

    @field_validator("category", "nationality", mode="before")
    @classmethod
    def normalize_profile_code(cls, value):
        if isinstance(value, str):
            return value.strip().lower() or None
        return value


class MatchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    profile: StudentProfile
    q: str | None = Field(default=None, max_length=120)
    portal: Portal | None = None


class CriterionResult(BaseModel):
    field: str | None = None
    status: Literal["pass", "fail", "unknown", "manual_review"]
    sourceText: str


MatchStatus = Literal["pass", "fail", "needs_information", "manual_review"]


class MatchResult(BaseModel):
    scholarship: Scholarship
    status: MatchStatus
    criteria: list[CriterionResult]
