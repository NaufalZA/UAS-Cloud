import os
import traceback
import base64
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

# Konfigurasi API Key Gemini
GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set!")
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI(title="Nops AI Service - Calorie Estimator")

# Struktur data yang diterima dari Backend
class ImageRequest(BaseModel):
    image_base64: str           # gambar dikirim sebagai base64 dari backend
    mime_type: str = "image/jpeg"
    image_url: Optional[str] = None  # opsional, hanya untuk referensi/log

@app.post("/estimate-calorie")
async def estimate_calorie(request: ImageRequest):
    image_path = "temp_food.jpg"
    sample_file = None
    try:
        # 1. Decode base64 dan simpan sebagai file sementara
        image_bytes = base64.b64decode(request.image_base64)
        with open(image_path, "wb") as f:
            f.write(image_bytes)

        # 2. Upload file ke Gemini Files API
        sample_file = genai.upload_file(path=image_path, display_name="Food Image")

        # 3. Panggil Model Gemini 1.5 Flash
        model = genai.GenerativeModel(model_name="gemini-3.5-flash")

        prompt = """
        Analyze this image and identify the food.
        Respond ONLY with a JSON format containing exactly two keys:
        - "food_name": (string, name of the food)
        - "estimated_calories": (integer, estimated total calories)
        Do not add any markdown, explanation, or extra text.
        """

        result = model.generate_content([sample_file, prompt])

        # 4. Kembalikan hasil dari Gemini
        return {"status": "success", "data": result.text}

    except HTTPException:
        raise
    except Exception as e:
        error_detail = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        print(f"[ERROR] /estimate-calorie failed:\n{error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)
    finally:
        # Bersihkan file sementara
        if os.path.exists(image_path):
            os.remove(image_path)
        if sample_file:
            try:
                genai.delete_file(sample_file.name)
            except Exception:
                pass

