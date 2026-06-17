# Gunakan image Python yang ringan
FROM python:3.10-slim

WORKDIR /app

# Salin requirements dan instal
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin kode utama
COPY app.py .

# Buka port 5000 (Sesuai firewall VPC AI yang kita buat)
EXPOSE 5000

# Jalankan server FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]