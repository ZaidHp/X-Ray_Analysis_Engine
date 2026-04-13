from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from uuid import uuid4
import os
import cv2
from datetime import datetime, timezone
from groq import Groq
from dotenv import load_dotenv
from bson import ObjectId
from bson.errors import InvalidId

from app.core.config import settings
from app.services.ai_service import ai_service
from app.services.visualizer import Visualizer
from app.utils.file_handler import FileHandler

from app.api.deps import get_current_user
from app.db.mongodb import get_database

load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing from .env")
client = Groq(api_key=GROQ_API_KEY)


@router.post("/detect")
async def detect_fracture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file type")
    
    detection_id = str(uuid4())
    input_path = None
    
    try:
        # 1. Save the uploaded file
        input_path = await FileHandler.save_upload(file, detection_id)
        
        # Read bytes for the DenseNet model
        with open(input_path, "rb") as f:
            image_bytes = f.read()
            
        # 2. Run DenseNet-121 Classification
        ai_result = ai_service.analyze_image(image_bytes)
        
        if ai_result.get("status") == "error":
            raise HTTPException(status_code=500, detail=ai_result.get("message"))
            
        diagnosis = ai_result["diagnosis"]
        confidence = ai_result["confidence"]
        
        # We still need the image array for the Visualizer
        img_array = cv2.imread(input_path)
        
        # 3. Generate Visualizations (Heatmaps/GradCAM instead of Bounding Boxes)
        expl_path = None
        gcam_path = None
        
        # We pass the diagnosis to the visualizer instead of boxes
        if diagnosis != "Normal":
            expl_path = Visualizer.generate_explanation(img_array, diagnosis, detection_id)
            gcam_path = Visualizer.generate_gradcam(img_array, diagnosis, detection_id)

        # 4. Prepare Summary for the LLM
        if diagnosis == "Normal":
            findings_summary = "No abnormalities or fractures were detected by the vision model. The structure appears normal."
            db_message = "No fractures detected"
        else:
            findings_summary = f"The AI model detected a {diagnosis} with a confidence of {confidence}%."
            db_message = "Detection completed successfully"

        # 5. LLM Consultation Generation
        system_prompt = """
        You are a supportive, knowledgeable AI medical assistant. 
        Your job is to take the results from a computer vision X-ray scan and provide a brief, 
        easy-to-understand summary for the patient. 
        
        Structure your response clearly:
        1. **Findings Summary:** Briefly explain what the computer vision model found.
        2. **General Recommendations:** Offer standard, general recovery or next-step advice based on the findings.
        3. **Disclaimer:** End with a strong, clear statement that this is an AI-assisted analysis and the user MUST consult a real doctor or orthopedic specialist for a true diagnosis.
        """

        llm_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.4, 
            max_tokens=1024,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please provide a consultation for these X-ray findings: {findings_summary}"}
            ]
        )
        
        ai_consultation_text = llm_response.choices[0].message.content
            
        # 6. Save Analysis Record to MongoDB
        analysis_record = {
            "user_id": current_user["id"],
            "detection_id": detection_id,
            "input_image_path": input_path,
            "message": db_message,
            "result_image_url": FileHandler.get_result_url(detection_id),
            "explanation_image_url": FileHandler.get_result_url(detection_id, "explanations") if expl_path else None,
            "gradcam_image_url": FileHandler.get_result_url(detection_id, "gradcam") if gcam_path else None,
            # Replaced the 'detections' array with a single 'classification' object
            "classification": {
                "class": diagnosis,
                "confidence": confidence
            },
            "ai_consultation": ai_consultation_text,
            "created_at": datetime.now(timezone.utc)
        }
        
        insert_result = await db["xray_analyses"].insert_one(analysis_record)
        analysis_record["id"] = str(insert_result.inserted_id)
        
        # Clean up response payload
        analysis_record.pop("_id", None)
        analysis_record.pop("user_id", None)
        analysis_record.pop("input_image_path", None)
        
        return analysis_record

    except Exception as e:
        if input_path and os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Error during detection processing: {str(e)}")


@router.get("/history")
async def get_xray_history_list(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retrieves a lightweight list of past X-ray analyses (summary only)."""
    
    cursor = db["xray_analyses"].find(
        {"user_id": current_user["id"]},
        {
            "detection_id": 1,
            "message": 1,
            "result_image_url": 1, 
            "created_at": 1
        }
    ).sort("created_at", -1)
    
    analyses = await cursor.to_list(length=100)
    
    history_summary = []
    for record in analyses:
        history_summary.append({
            "id": str(record["_id"]),
            "detection_id": record.get("detection_id"),
            "message": record.get("message"),
            "result_image_url": record.get("result_image_url"),
            "created_at": record.get("created_at")
        })
        
    return {"success": True, "history": history_summary}


@router.get("/history/{analysis_id}")
async def get_xray_detail(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retrieves the full, detailed record of a specific X-ray analysis."""
    
    try:
        obj_id = ObjectId(analysis_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid analysis ID format.")
    
    record = await db["xray_analyses"].find_one({
        "_id": obj_id,
        "user_id": current_user["id"]
    })
    
    if not record:
        raise HTTPException(status_code=404, detail="X-ray analysis not found.")
        
    return {
        "success": True,
        "analysis": {
            "id": str(record["_id"]),
            "detection_id": record.get("detection_id"),
            "message": record.get("message"),
            "result_image_url": record.get("result_image_url"),
            "explanation_image_url": record.get("explanation_image_url"),
            "gradcam_image_url": record.get("gradcam_image_url"),
            "detections": record.get("detections", []),
            "ai_consultation": record.get("ai_consultation"),
            "created_at": record.get("created_at")
        }
    }