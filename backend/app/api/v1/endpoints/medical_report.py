import os
import shutil
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from groq import Groq
from llama_parse import LlamaParse
from dotenv import load_dotenv

from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.core.config import settings

load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing from .env")

if not LLAMA_CLOUD_API_KEY:
    raise RuntimeError("LLAMA_CLOUD_API_KEY is missing from .env")

client = Groq(api_key=GROQ_API_KEY)


async def parse_document(file_path: str) -> str:
    """Parses the uploaded file using LlamaParse."""
    try:
        parser = LlamaParse(
            result_type="markdown",
            api_key=LLAMA_CLOUD_API_KEY
        )
        documents = await parser.aload_data(file_path)

        if not documents:
            return ""

        return "\n".join(doc.text for doc in documents)

    except Exception as e:
        print(f"LlamaParse error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to extract text from document"
        )


@router.post("/analyze")
async def analyze_report(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Analyzes a medical report and links it to the authenticated user."""
    saved_file_path = None

    try:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        report_dir = os.path.join(settings.UPLOAD_DIR, "reports")
        os.makedirs(report_dir, exist_ok=True)
        
        saved_file_path = os.path.join(report_dir, unique_filename)

        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document_text = await parse_document(saved_file_path)

        if not document_text.strip():
            if os.path.exists(saved_file_path):
                os.remove(saved_file_path)
            raise HTTPException(
                status_code=400,
                detail="No readable text found in the document"
            )

        # 3. Basic medical validation
        medical_keywords = [
            "blood", "test", "diagnosis", "report", "health",
            "scan", "medical", "doctor", "patient", "x-ray", "mri"
        ]

        if not any(k in document_text.lower() for k in medical_keywords):
            if os.path.exists(saved_file_path):
                os.remove(saved_file_path)
            return {
                "success": False,
                "analysis": "The uploaded file does not appear to be a medical report."
            }

        system_prompt = """
        You are a compassionate and knowledgeable medical report interpreter.
        Translate complex medical information into clear, patient-friendly insights.
        Avoid diagnosis. Encourage professional consultation when necessary.
        """

        user_prompt = f"""
        Analyze the following medical report and provide a structured, easy-to-understand summary.

        Medical Report:
        {document_text}

        Use this format:
        - Friendly greeting
        - Report overview
        - Simplified explanation
        - Health status table (| Parameter | Value | Reference Range |)
        - Potential implications
        - Lifestyle & wellness recommendations

        Tone: supportive, clear, empowering.
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=2048,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )

        analysis = completion.choices[0].message.content

        report_record = {
            "user_id": current_user["id"], 
            "original_filename": file.filename,
            "saved_file_path": saved_file_path,
            "extracted_text": document_text,
            "analysis_result": analysis,
            "created_at": datetime.now(timezone.utc) 
        }
        
        await db["medical_reports"].insert_one(report_record)

        report_record.pop("_id", None)

        return {
            "success": True,
            "report": {
                "id": str(report_record.get("id", "")),
                "originalDocument": document_text,
                "analysis": analysis,
                "saved_at": report_record["created_at"]
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        print(f"Processing error: {e}")
        if saved_file_path and os.path.exists(saved_file_path):
            os.remove(saved_file_path)
            
        raise HTTPException(
            status_code=500,
            detail="Internal server error during report analysis"
        )


@router.get("/history")
async def get_report_history(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retrieves all past medical reports analyzed by the authenticated user."""
    
    cursor = db["medical_reports"].find({"user_id": current_user["id"]}).sort("created_at", -1)
    
    reports = await cursor.to_list(length=100)
    
    history = []
    for report in reports:
        history.append({
            "id": str(report["_id"]),
            "original_filename": report.get("original_filename"),
            "analysis_result": report.get("analysis_result"),
            "created_at": report.get("created_at")
        })
        
    return {"success": True, "history": history}