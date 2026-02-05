from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_status():
    """
    Returns the current status of the API server.
    """
    return {
        "status": "success",
        "message": "Server is running",
        "version": "1.0.0"
    }

@router.get("/health")
async def health_check():
    """
    Standard health check endpoint for monitoring tools.
    """
    return {"status": "healthy", "message": "API is running properly"}