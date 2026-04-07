from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from uuid import uuid4
import os
import cv2
from datetime import datetime, timezone
from groq import Groq
from dotenv import load_dotenv

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
        input_path = await FileHandler.save_upload(file, detection_id)
        results, img_array = ai_service.predict(input_path)
        
        res_path = os.path.join(settings.RESULT_DIR, f"{detection_id}_result.jpg")
        cv2.imwrite(res_path, results[0].plot())
        
        boxes = []
        detections = []
        detected_classes = []
        
        for i, box in enumerate(results[0].boxes.cpu().numpy()):
            coords = box.xyxy[0]
            class_name = results[0].names[int(box.cls[0])]
            confidence = float(box.conf[0])
            
            boxes.append(coords)
            detected_classes.append(f"{class_name} ({confidence*100:.1f}% confidence)")
            
            detections.append({
                "id": i,
                "class": class_name,
                "confidence": confidence,
                "box": {
                    "x1": float(coords[0]), "y1": float(coords[1]), 
                    "x2": float(coords[2]), "y2": float(coords[3])
                }
            })
        
        expl_path = None
        gcam_path = None
        if boxes:
            expl_path = Visualizer.generate_explanation(img_array, boxes, detection_id)
            gcam_path = Visualizer.generate_gradcam(img_array, boxes, detection_id)

        if not boxes:
            findings_summary = "No abnormalities or fractures were detected by the vision model."
        else:
            findings_summary = "The following potential issues were detected: " + ", ".join(detected_classes)

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
            
        analysis_record = {
            "user_id": current_user["id"],
            "detection_id": detection_id,
            "input_image_path": input_path,
            "message": "Detection completed successfully" if boxes else "No fractures detected",
            "result_image_url": FileHandler.get_result_url(detection_id),
            "explanation_image_url": FileHandler.get_result_url(detection_id, "explanations") if expl_path else None,
            "gradcam_image_url": FileHandler.get_result_url(detection_id, "gradcam") if gcam_path else None,
            "detections": detections,
            "ai_consultation": ai_consultation_text,
            "created_at": datetime.now(timezone.utc)
        }
        
        insert_result = await db["xray_analyses"].insert_one(analysis_record)
        analysis_record["id"] = str(insert_result.inserted_id)
        analysis_record.pop("_id", None)
        analysis_record.pop("user_id", None)
        analysis_record.pop("input_image_path", None)
        
        return analysis_record

    except Exception as e:
        if input_path and os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Error during detection processing: {str(e)}")


@router.get("/history")
async def get_xray_history(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    cursor = db["xray_analyses"].find({"user_id": current_user["id"]}).sort("created_at", -1)
    analyses = await cursor.to_list(length=100)
    
    history = []
    for record in analyses:
        history.append({
            "id": str(record["_id"]),
            "detection_id": record.get("detection_id"),
            "message": record.get("message"),
            "result_image_url": record.get("result_image_url"),
            "explanation_image_url": record.get("explanation_image_url"),
            "gradcam_image_url": record.get("gradcam_image_url"),
            "detections": record.get("detections", []),
            "ai_consultation": record.get("ai_consultation"),
            "created_at": record.get("created_at")
        })
        
    return {"success": True, "history": history}