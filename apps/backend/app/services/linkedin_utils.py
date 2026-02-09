"""LinkedIn job utilities: validation and scraping."""

from urllib.parse import urlparse, parse_qs
import requests
from bs4 import BeautifulSoup
from typing import Dict
import logging

logger = logging.getLogger("linkedin_utils")


def validate_and_transform_linkedin_url(url: str) -> str:
    """
    Validate and transform LinkedIn job URL to the correct format.
    Args:
        url: LinkedIn job URL to validate and transform
    Returns:
        Transformed URL in format: https://www.linkedin.com/jobs/view/{job_id}/
    Raises:
        ValueError: If URL is not a valid LinkedIn job URL
    """
    try:
        parsed = urlparse(url)
        if parsed.netloc != 'www.linkedin.com':
            raise ValueError(f"URL must be from www.linkedin.com, got: {parsed.netloc}")
        if 'currentJobId' in url:
            query_params = parse_qs(parsed.query)
            job_id = query_params.get('currentJobId', [None])[0]
            if not job_id:
                raise ValueError("currentJobId parameter not found in URL")
            return f"https://www.linkedin.com/jobs/view/{job_id}/"
        elif parsed.path.startswith('/jobs/view/'):
            path_parts = parsed.path.strip('/').split('/')
            if len(path_parts) >= 3 and path_parts[2]:
                job_id = path_parts[2]
                if not job_id.isdigit():
                    raise ValueError(f"Invalid job ID: {job_id}")
                return f"https://www.linkedin.com/jobs/view/{job_id}/"
            else:
                raise ValueError("Job ID not found in /jobs/view/ URL")
        else:
            raise ValueError(f"Unsupported LinkedIn URL format. Expected /jobs/collections/ or /jobs/view/, got: {parsed.path}")
    except Exception as e:
        logger.error(f"LinkedIn URL validation failed for {url}: {e}")
        raise ValueError(f"Invalid LinkedIn job URL: {str(e)}")

def get_job_details(vacancy_link: str) -> Dict[str, str]:
    """
    Extract job details from LinkedIn job posting.
    Args:
        vacancy_link: LinkedIn job URL
    Returns:
        Dictionary with 'description' and 'company_name' keys
    """
    try:
        html = requests.get(vacancy_link).text
        soup = BeautifulSoup(html, 'html.parser')
        description_div = soup.find('div', class_='description__text')
        description = description_div.text if description_div else ""
        company_name = None
        company_elem = soup.find('a', class_='topcard__org-name-link')
        if company_elem:
            company_name = company_elem.text.strip()
        if not company_name:
            company_elem = soup.find('span', class_='topcard__flavor')
            if company_elem:
                company_name = company_elem.text.strip()
        return {
            'description': description,
            'company_name': company_name
        }
    except Exception as e:
        logger.error(f"Error parsing job details from {vacancy_link}: {e}")
        return {
            'description': "",
            'company_name': None
        }
