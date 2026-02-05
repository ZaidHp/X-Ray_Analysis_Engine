from fastapi import APIRouter, UploadFile, File, HTTPException
from uuid import uuid4
import os
import cv2
from app.core.config import settings
from app.services.ai_service import ai_service
from app.services.visualizer import Visualizer
from app.utils.file_handler import FileHandler

router = APIRouter()

@router.post("/detect")
async def detect_fracture(file: UploadFile = File(...)):
    """
    Endpoint to receive an X-Ray image, run YOLOv8 detection, 
    and generate explanation/Grad-CAM visualizations.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file type")
    
    detection_id = str(uuid4())
    
    try:
        input_path = await FileHandler.save_upload(file, detection_id)
        
        results, img_array = ai_service.predict(input_path)
        
        res_path = os.path.join(settings.RESULT_DIR, f"{detection_id}_result.jpg")
        cv2.imwrite(res_path, results[0].plot())
        
        boxes = []
        detections = []
        for i, box in enumerate(results[0].boxes.cpu().numpy()):
            coords = box.xyxy[0]
            boxes.append(coords)
            detections.append({
                "id": i,
                "class": results[0].names[int(box.cls[0])],
                "confidence": float(box.conf[0]),
                "box": {
                    "x1": float(coords[0]), 
                    "y1": float(coords[1]), 
                    "x2": float(coords[2]), 
                    "y2": float(coords[3])
                }
            })
        
        expl_path = None
        gcam_path = None
        
        if boxes:
            expl_path = Visualizer.generate_explanation(img_array, boxes, detection_id)
            gcam_path = Visualizer.generate_gradcam(img_array, boxes, detection_id)
        
        return {
            "detection_id": detection_id,
            "message": "Detection completed successfully",
            "result_image": FileHandler.get_result_url(detection_id),
            "explanation_image": FileHandler.get_result_url(detection_id, "explanations") if expl_path else None,
            "gradcam_image": FileHandler.get_result_url(detection_id, "gradcam") if gcam_path else None,
            "detections": detections
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during detection processing: {str(e)}")