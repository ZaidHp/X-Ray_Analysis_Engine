import cv2
import numpy as np
from app.core.config import settings

class Visualizer:
    @staticmethod
    def generate_explanation(image_array, boxes, detection_id):
        explanation_img = image_array.copy()
        for box in boxes:
            x1, y1, x2, y2 = [int(coord) for coord in box]
            cv2.rectangle(explanation_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            highlight = np.zeros_like(explanation_img, dtype=np.uint8)
            pad = 10
            cv2.rectangle(highlight, (max(0, x1-pad), max(0, y1-pad)), 
                         (min(explanation_img.shape[1], x2+pad), min(explanation_img.shape[0], y2+pad)), 
                         (0, 0, 255), -1)
            explanation_img = cv2.addWeighted(explanation_img, 1, highlight, 0.3, 0)
        
        path = f"{settings.EXPLANATION_DIR}/{detection_id}_explanation.jpg"
        cv2.imwrite(path, explanation_img)
        return path

    @staticmethod
    def generate_gradcam(image_array, boxes, detection_id):
        height, width = image_array.shape[:2]
        heatmap = np.zeros((height, width), dtype=np.float32)
        
        for box in boxes:
            x1, y1, x2, y2 = [int(coord) for coord in box]
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            sx, sy = max((x2 - x1) / 6, 10), max((y2 - y1) / 6, 10)
            
            y, x = np.ogrid[:height, :width]
            gaussian = np.exp(-(((x - cx)**2)/(2*sx**2) + ((y - cy)**2)/(2*sy**2)))
            heatmap = np.maximum(heatmap, gaussian)
        
        heatmap = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        gradcam_vis = cv2.addWeighted(image_array, 0.6, heatmap, 0.4, 0)
        
        path = f"{settings.GRADCAM_DIR}/{detection_id}_gradcam.jpg"
        cv2.imwrite(path, gradcam_vis)
        return path