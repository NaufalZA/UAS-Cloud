# 

**INSTITUT TEKNOLOGI NASIONAL**  
Jalan Penghulu K.H. Mustapa 23 Telp. 7272215, Bandung- 40124

**EVALUASI AKHIR SEMESTER (Presentasi Project)**  
**SEMESTER GENAP  2025/2026**

Mata Kuliah	    : Cloud Computing		 	Tanggal  :  11 Juni 2026\.  
Program Studi   : Informatika		 		Waktu     :  11.00 – 13.00  
Dosen		    : Diash Firdaus, M.T.			Sifat    : Presentasi Project  
Kelas 		    : AA \- BB

**SUBCPMK 5 (100%)**

## **Deskripsi Tugas**

Buat sebuah aplikasi berbasis **Cloud Computing** yang mendukung salah satu tujuan **Sustainable Development Goals (SDGs)** berikut:

1. **Kesehatan**  
    Contoh: Diagnosa medis, telemedicine, monitoring pasien, riset obat.  
2. **Reformasi Birokrasi**  
    Contoh: Digitalisasi administrasi publik, sistem pelayanan masyarakat, e-government.  
3. **Pendidikan**  
    Contoh: Pembelajaran adaptif, analisis akademik, LMS berbasis AI.  
4. **Ketahanan Pangan**  
    Contoh: Smart farming, monitoring pertanian/perikanan, prediksi hasil panen.  
5. **Mobilitas & Kota Cerdas**  
    Contoh: Smart transportation, traffic management, parkir pintar.

---

# **Ketentuan Utama**

Aplikasi wajib memiliki minimal **1 fitur Artificial Intelligence (AI)** yang terintegrasi langsung ke sistem.

### **AI dapat menggunakan:**

* Model lokal/open source  
* API pihak ketiga  
* LLM (Large Language Model)  
* Computer Vision  
* Machine Learning

### **Contoh layanan AI yang diperbolehkan:**

* [Hugging Face](https://huggingface.co?utm_source=chatgpt.com)  
* [Google Gemini API](https://ai.google.dev/?utm_source=chatgpt.com)  
* [OpenAI API](https://platform.openai.com/?utm_source=chatgpt.com)  
* [Mistral AI](https://mistral.ai/?utm_source=chatgpt.com)  
* [Qwen AI](https://qwen.ai/?utm_source=chatgpt.com)  
* Claude API  
* Ollama  
* TensorFlow  
* PyTorch

---

# **Ketentuan Aplikasi**

Aplikasi wajib menggunakan arsitektur **Cloud Native** dan terdiri dari komponen berikut:

## **Komponen Wajib**

1. Frontend  
2. Backend / API  
3. Database  
4. Object Storage / Bucket  
5. Docker Container  
6. CDN (Content Delivery Network)  
7. VPC (Virtual Private Cloud)  
8. AI Service / AI Engine

---

# **Ketentuan Infrastruktur Cloud**

## **Segmentasi VPC**

Setiap komponen berikut harus ditempatkan pada **VPC yang berbeda**:

* Frontend VPC  
* Backend VPC  
* Database VPC  
* Bucket / Storage VPC  
* AI Service VPC (optional tetapi direkomendasikan)

---

# **Multi Cloud Requirement**

Bucket/Object Storage wajib menggunakan layanan cloud yang berbeda dari layanan utama aplikasi.

### **Contoh:**

* Compute menggunakan AWS  
* Bucket menggunakan GCP Cloud Storage

ATAU

* Compute menggunakan Azure  
* Bucket menggunakan AWS S3

---

# **Containerization & Deployment**

## **Wajib**

* Docker  
* Docker Compose / Container Registry

## **Optional (Nilai Tambahan)**

* Kubernetes (K8s)  
* Helm  
* Istio  
* Service Mesh

---

# **CI/CD Requirement**

Aplikasi wajib memiliki proses **CI/CD**.

### **Pipeline minimal:**

1. Build  
2. Test  
3. Dockerize  
4. Push image  
5. Deploy otomatis

---

# **Deliverables / Pengumpulan**

## **1\. Laporan PDF**

Laporan wajib berisi:

* Latar belakang masalah  
* Analisis sistem  
* Arsitektur cloud  
* Integrasi AI  
* CI/CD  
* Tutorial deployment  
* Monitoring sistem  
* Kesimpulan

Format:

* PDF  
* Minimal 20 halaman

---

## **2\. Repository GitHub**

Repository wajib berisi:

* Frontend  
* Backend  
* Database (.sql)  
* Dockerfile  
* docker-compose.yml  
* README.md  
* Dokumentasi API  
* Dokumentasi AI

---

## **3\. Draft HKI**

[Template Draft HKI](https://drive.google.com/drive/folders/15P-BgKQ8puJtncgFWpzlnDjXz8W65huw?usp=drive_link&utm_source=chatgpt.com)

---

## **4\. Video Presentasi**

Setiap kelompok wajib membuat video presentasi aplikasi dengan ketentuan berikut:

### **Isi Video**

Video wajib memuat:

1. Penjelasan masalah SDGs yang dipilih  
2. Demo fitur aplikasi  
3. Penjelasan arsitektur cloud  
4. Penjelasan integrasi AI  
5. Penjelasan CI/CD  
6. Demo deployment aplikasi  
   ---

   ### **Ketentuan Video**

* Durasi video: **10–15 menit**  
* Format video: **MP4**  
* Upload ke: YouTube (link dicantumkan pada laporan)  
* Resolusi minimal: **720p**  
* Audio harus jelas dan dapat dipahami  
* setiap anggota harus melakukan presentasi bagiannya  
  ---

  ### **Aturan Presentasi Video**

* Video wajib dibuat dengan format **NO CUT NO EDIT**  
* Presentasi dilakukan dalam **1 kali rekaman penuh**  
* Tidak diperbolehkan:  
  * Pemotongan video  
  * Penggabungan clip  
  * Voice over terpisah  
  * Editing transisi  
  * Manipulasi demo

Tujuan:

* Menguji kesiapan sistem secara real-time  
* Menguji pemahaman seluruh anggota kelompok  
* Memastikan deployment dan aplikasi benar-benar berjalan

---

# **Evaluasi Akhir**

## **Ketentuan Kelompok**

* Tugas dikerjakan secara **berkelompok**.  
* Jumlah anggota maksimal **3 orang** per kelompok.  
* Setiap anggota wajib memahami:  
  * Arsitektur cloud  
  * Deployment  
  * Integrasi AI  
  * CI/CD  
  * Source code aplikasi

---

## **Progress Mingguan**

Setiap kelompok wajib mengumpulkan **laporan progres mingguan** selama pengerjaan proyek berlangsung.

### **Ketentuan Progress**

Laporan progres digunakan untuk memantau:

* Pembagian tugas anggota  
* Perkembangan implementasi sistem  
* Kendala yang dihadapi  
* Progress deployment dan integrasi cloud  
* Progress AI dan CI/CD

---

## **Isi Laporan Progress Mingguan**

Minimal berisi:

1. Nama kelompok dan anggota  
2. Progress pekerjaan minggu berjalan  
3. Screenshot hasil pengerjaan  
4. Kendala dan solusi  
5. Target pengerjaan minggu berikutnya  
6. Link repository GitHub terbaru

---

## **Format Pengumpulan**

* Format file: PDF  
* Nama file:

Progress\_KelompokX\_MingguX.pdf

Contoh:

Progress\_Kelompok3\_Minggu2.pdf  
---

## **Pengumpulan**

Seluruh progress mingguan wajib dikumpulkan pada folder Google Drive berikut:

[Kelas AA](https://drive.google.com/drive/folders/1mxsYk6cf-IgijsRKFJ7wL5XSsztX9rmo?usp=sharing)

[Kelas BB](https://drive.google.com/drive/folders/1FlRk3_H5TfmMjbjDAiROIYhg_TXpe3JM?usp=sharing)

---

## **Ketentuan Tambahan**

* Progress dikumpulkan setiap minggu sesuai jadwal perkuliahan.  
* Keterlambatan pengumpulan akan mengurangi nilai dokumentasi.  
* Kelompok yang tidak mengumpulkan progress lebih dari 2 kali dianggap tidak aktif dalam pengerjaan proyek.  
* Dosen berhak melakukan pengecekan repository GitHub sewaktu-waktu untuk memastikan progress sesuai laporan.

# **Rubrik Penilaian**

| No | Aspek Penilaian | Kriteria Penilaian | Bobot |
| :---: | :---: | :---: | :---: |
| 1 | Implementasi Cloud Architecture | Penggunaan cloud service, VPC, CDN, scalability, security | 20% |
| 2 | Integrasi AI | Implementasi AI berjalan dengan baik dan relevan dengan SDGs | 20% |
| 3 | Multi-Cloud Architecture | Integrasi bucket/service lintas cloud provider | 10% |
| 4 | Frontend & Backend | Fungsionalitas aplikasi dan integrasi API | 10% |
| 5 | Database Design | Struktur database, relasi, optimasi query | 5% |
| 6 | Docker & Containerization | Dockerfile, container orchestration, deployment | 10% |
| 7 | CI/CD Pipeline | Build, testing, deployment otomatis | 10% |
| 8 | Dokumentasi & Manual Guide | Kelengkapan laporan dan tutorial deployment | 5% |
| 9 | Video Demo | Kejelasan penjelasan dan demo sistem | 5% |
| 10 | Presentasi | Pemahaman konsep oleh seluruh anggota | 5% |

---

# **Bonus Penilaian**

| Bonus | Tambahan Nilai |
| :---: | :---: |
| Kubernetes Implementation | \+5 |
| Terraform / Infrastructure as Code | \+5 |
| Monitoring Grafana/Prometheus | \+3 |
| Self-hosted AI Model | \+5 |
| Autoscaling | \+3 |
| Serverless Architecture | \+3 |
| GPU Cloud Deployment | \+5 |

---

# **Catatan**

* Seluruh anggota kelompok harus aktif berkontribusi.  
* Dilarang copy-paste project tanpa modifikasi.  
* Deployment wajib dapat dijalankan saat demo/evaluasi.  
* Repository GitHub harus dapat diakses saat penilaian berlangsung.  
* Nilai individu dapat berbeda berdasarkan hasil tanya jawab saat evaluasi akhir.

