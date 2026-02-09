"""Job description management endpoints."""

from fastapi import APIRouter, HTTPException

from app.database import db
from app.schemas import JobUploadRequest, JobUploadResponse
from app.services.linkedin_utils import validate_and_transform_linkedin_url, get_job_details

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/upload", response_model=JobUploadResponse)
async def upload_job_descriptions(request: JobUploadRequest) -> JobUploadResponse:
    """Upload one or more job descriptions or LinkedIn job links.

    Accepts either raw text or LinkedIn job URLs. If a LinkedIn URL is provided, fetches the job description.
    Returns an array of job_ids corresponding to the input array.
    """
    if not request.job_descriptions:
        raise HTTPException(status_code=400, detail="No job descriptions provided")

    job_ids = []
    for jd in request.job_descriptions:
        jd = jd.strip()
        if not jd:
            raise HTTPException(status_code=400, detail="Empty job description")

        # Detect LinkedIn job URL
        is_linkedin = jd.startswith("http://") or jd.startswith("https://")
        company_name = None
        if is_linkedin and "linkedin.com/jobs" in jd:
            try:
                url = validate_and_transform_linkedin_url(jd)
                details = get_job_details(url)
                content = details.get("description", "")
                company_name = details.get("company_name")
                if not content:
                    raise HTTPException(status_code=400, detail="Could not extract job description from LinkedIn link")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"LinkedIn job link error: {str(e)}")
        else:
            content = jd.strip()

        job = db.create_job(
            content=content,
            resume_id=request.resume_id,
            company_name=company_name,
        )
        job_ids.append(job["job_id"])

    return JobUploadResponse(
        message="data successfully processed",
        job_id=job_ids,
        request={
            "job_descriptions": request.job_descriptions,
            "resume_id": request.resume_id,
        },
    )


@router.get("/{job_id}")
async def get_job(job_id: str) -> dict:
    """Get job description by ID."""
    job = db.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job
