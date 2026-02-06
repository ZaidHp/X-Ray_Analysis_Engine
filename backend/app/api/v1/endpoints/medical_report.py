import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from groq import Groq
from llama_parse import LlamaParse
from dotenv import load_dotenv

# Load .env file
load_dotenv()

router = APIRouter()

# Validate API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing from .env")

if not LLAMA_CLOUD_API_KEY:
    raise RuntimeError("LLAMA_CLOUD_API_KEY is missing from .env")

# Initialize Groq Client
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
async def analyze_report(file: UploadFile = File(...)):
    tmp_path = None

    try:
        # 1. Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # 2. Extract text
        document_text = await parse_document(tmp_path)

        if not document_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in the document"
            )

        # 3. Basic medical validation
        medical_keywords = [
            "blood", "test", "diagnosis", "report", "health",
            "scan", "medical", "doctor", "patient"
        ]

        if not any(k in document_text.lower() for k in medical_keywords):
            return {
                "success": False,
                "analysis": "The uploaded file does not appear to be a medical report."
            }

        # 4. AI Analysis
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

        return {
            "success": True,
            "report": {
                "originalDocument": document_text,
                "analysis": analysis
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        print(f"Processing error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during report analysis"
        )

    finally:
        # Cleanup temp file
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
