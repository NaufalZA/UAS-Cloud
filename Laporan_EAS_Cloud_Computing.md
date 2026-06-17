# LAPORAN EVALUASI AKHIR SEMESTER (EAS)
## CLOUD COMPUTING 2025/2026

**Topik Projek:** CalorieTracker - Aplikasi Pemindai Nutrisi dan Kalori Cerdas Berbasis Cloud Native dan Artificial Intelligence
**Mata Kuliah:** Cloud Computing
**Program Studi:** Informatika
**Institut Teknologi Nasional**

---

## BAB 1: PENDAHULUAN

### 1.1 Latar Belakang Masalah
Kesehatan adalah salah satu aspek fundamental dalam kehidupan manusia dan merupakan elemen kunci dalam pembangunan berkelanjutan. Hal ini secara eksplisit ditegaskan dalam Sustainable Development Goals (SDGs) Tujuan ke-3: *Good Health and Well-being* (Kehidupan Sehat dan Sejahtera). Di era modern, urbanisasi dan gaya hidup yang serba cepat seringkali mendorong masyarakat untuk mengonsumsi makanan cepat saji atau makanan olahan tinggi kalori yang rendah nutrisi. Kurangnya kesadaran dan kesulitan dalam melacak asupan kalori harian telah menyebabkan lonjakan drastis pada kasus obesitas, diabetes melitus tipe 2, dan penyakit kardiovaskular secara global. 

Berdasarkan data dari Organisasi Kesehatan Dunia (WHO), obesitas telah mencapai tingkat epidemi global, di mana jutaan orang dewasa dan anak-anak mengalami kelebihan berat badan. Salah satu penyebab utamanya adalah ketidakmampuan individu untuk secara akurat memantau asupan makanan mereka. Proses pencatatan kalori secara manual seringkali memakan waktu, membosankan, dan tidak akurat karena masyarakat awam kesulitan mengestimasi porsi dan kandungan gizi dari makanan yang ada di hadapan mereka.

Untuk mengatasi permasalahan ini, diperlukan sebuah intervensi teknologi yang dapat menyederhanakan proses pemantauan nutrisi. Teknologi *Cloud Computing* dan *Artificial Intelligence* (AI) menawarkan solusi yang revolusioner. Melalui implementasi *Computer Vision* dan *Large Language Models* (LLM), proses identifikasi makanan dan estimasi kalori dapat diotomatisasi secara instan hanya melalui sebuah unggahan foto. 

Oleh karena itu, proyek "CalorieTracker" dikembangkan. CalorieTracker adalah aplikasi berbasis arsitektur *Cloud Native* yang memanfaatkan kapabilitas infrastruktur *multi-cloud* dan model AI canggih untuk memfasilitasi gaya hidup sehat. Aplikasi ini dirancang agar memiliki skalabilitas tinggi, ketersediaan tinggi (*high availability*), dan efisiensi biaya (*cost-effectiveness*) yang menjadi prinsip utama dalam *Cloud Computing*.

### 1.2 Tujuan Proyek
1. Mengembangkan aplikasi pemantau kalori cerdas yang mendukung pencapaian SDG 3 (Kesehatan yang Baik dan Kesejahteraan).
2. Mengimplementasikan arsitektur *Cloud Native* yang mencakup *microservices*, *containerization*, dan orkestrasi menggunakan Kubernetes.
3. Menerapkan skenario *Multi-Cloud* dengan memanfaatkan layanan dari beberapa *cloud provider* yang berbeda untuk mencegah *vendor lock-in*.
4. Mengintegrasikan teknologi *Artificial Intelligence* (Google Gemini Vision) untuk menganalisis dan mengestimasi kalori dari gambar makanan secara otomatis.
5. Membangun dan mendemonstrasikan proses otomatisasi *Continuous Integration* dan *Continuous Deployment* (CI/CD) yang efisien.

---

## BAB 2: ANALISIS SISTEM

### 2.1 Deskripsi Aplikasi CalorieTracker
CalorieTracker adalah sebuah platform berbasis web yang memungkinkan pengguna untuk memantau asupan nutrisi harian mereka melalui antarmuka yang intuitif. Pengguna dapat mengunggah foto makanan mereka ke dalam aplikasi. Sistem kemudian akan memproses gambar tersebut, menyimpannya ke dalam *Object Storage*, dan mengirimkannya ke mesin AI untuk dianalisis. Mesin AI akan mengidentifikasi nama makanan dan memperkirakan jumlah kalori yang terkandung di dalamnya. Hasil analisis ini kemudian ditampilkan kepada pengguna dan disimpan secara permanen di dalam *database* sebagai riwayat (*history*) pindaian.

### 2.2 Komponen Arsitektur Sistem (Microservices)
Aplikasi ini tidak dibangun secara *monolithic*, melainkan dipecah menjadi beberapa layanan mikro (*microservices*) yang saling berkomunikasi melalui API. Pemisahan ini bertujuan untuk kemudahan pengembangan, *scaling* independen, dan isolasi *fault*.

1. **Frontend (Client-Side):**
   - **Teknologi:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla).
   - **Desain:** Menggunakan pendekatan antarmuka modern seperti *Dark Mode*, *Glassmorphism*, dan tipografi yang elegan (menggunakan *font* Inter dan Plus Jakarta Sans). Desain dibuat sangat responsif agar kompatibel pada perangkat desktop maupun *mobile*.
   - **Fungsi:** Menyediakan antarmuka interaktif yang memiliki fitur *drag-and-drop* untuk *upload* gambar, menampilkan *loading state* interaktif saat AI sedang memproses, serta halaman *dashboard* yang menampilkan riwayat konsumsi kalori (*history*).

2. **Backend (API Gateway & Logic):**
   - **Teknologi:** Node.js dengan framework Express.js.
   - **Fungsi:** Bertindak sebagai jembatan antara klien (Frontend), media penyimpanan (Cloudflare R2), sistem cerdas (AI Service), dan pusat data (PostgreSQL). Backend menggunakan *library* `multer` untuk menerima file sementara, AWS SDK v3 (diadaptasi untuk R2) untuk operasi *storage*, dan `axios` untuk komunikasi antar- *microservice*.

3. **AI Service (Inference Engine):**
   - **Teknologi:** Python dengan framework FastAPI.
   - **Fungsi:** Layanan terdedikasi ini khusus menangani operasi *machine learning* dan AI. Layanan ini menerima muatan berupa gambar dengan format `Base64`, memvalidasinya, dan berinteraksi dengan API eksternal (Google Gemini) untuk melakukan *image inference*. Pemisahan ini memungkinkan AI Service di- *scale* secara independen, terutama karena proses AI seringkali lebih intensif dalam penggunaan *resource*.

4. **Database (Data Persistence):**
   - **Teknologi:** PostgreSQL.
   - **Fungsi:** Menyimpan entitas data secara terstruktur. Tabel `meal_logs` menyimpan informasi esensial seperti `food_name`, `calories`, `image_url` (tautan publik dari *bucket*), dan *timestamp* waktu pindaian.

---

## BAB 3: ARSITEKTUR CLOUD & MULTI-CLOUD REQUIREMENT

### 3.1 Skema Multi-Cloud Architecture
Untuk memenuhi standar industri modern dan spesifikasi proyek, CalorieTracker menerapkan **Multi-Cloud Strategy**. Strategi ini memastikan bahwa aplikasi tidak sepenuhnya bergantung pada satu penyedia layanan awan (*Cloud Provider*), yang bertujuan untuk optimasi biaya, kepatuhan letak geografis data, serta meningkatkan keandalan sistem.

1. **Compute Service (Layanan Komputasi): Google Cloud Platform (GCP) - GKE**
   - Seluruh beban kerja komputasi aplikasi, yaitu Frontend, Backend, AI Service, dan Database, dijalankan di dalam **Google Kubernetes Engine (GKE)**. GKE dipilih sebagai lingkungan orkestrasi *container* tingkat *production* karena kemampuannya dalam melakukan auto-scaling, *load balancing*, dan manajemen siklus hidup *container* yang luar biasa.

2. **Object Storage Service: Cloudflare R2**
   - Berbeda dengan *provider* komputasi, layanan penyimpanan objek untuk gambar makanan menggunakan **Cloudflare R2**. R2 dipilih karena menawarkan keuntungan signifikan berupa **Nol Biaya Egress** (gratis biaya transfer data keluar), yang sangat vital bagi aplikasi berbasis media yang sering melayani pengunduhan gambar (seperti gambar *thumbnail* riwayat makanan pada halaman utama pengguna). Cloudflare R2 bersifat kompatibel dengan S3 API, sehingga integrasinya dengan aplikasi Node.js menggunakan modul standar kelistrikan S3 sangat mulus.

### 3.2 Segmentasi Jaringan & Virtual Private Cloud (VPC)
Pemisahan jaringan (*network segmentation*) adalah pilar utama keamanan *Cloud Native*. Dalam implementasi *production* di Kubernetes, segmentasi ini diimplementasikan menggunakan kombinasi isolasi Namespace dan *Network Policies* (atau di tingkat infrastruktur *cloud* menggunakan *subnet* VPC yang berbeda).

1. **Frontend VPC / Ingress Layer:**
   - Ini adalah satu-satunya lapisan yang bersentuhan langsung dengan internet publik (*Public Subnet*). Berisi layanan Ingress / Load Balancer yang mengarahkan trafik HTTPS masuk dari pengguna ke *service* Frontend.
2. **Backend VPC (Application Subnet):**
   - Subnet *private* yang menampung *Backend Node.js*. Tidak dapat diakses langsung dari internet; hanya dapat dijangkau oleh *request* dari Frontend.
3. **AI Service VPC (Compute-Intensive Subnet):**
   - Subnet terisolasi khusus untuk menampung *Python FastAPI*. Lapisan ini tidak diekspos ke publik sama sekali. Ia hanya menerima trafik internal dari *Backend VPC* dan diizinkan melakukan koneksi *outbound* (keluar) untuk menghubungi *endpoint* Google Gemini API.
4. **Database VPC (Data Persistence Subnet):**
   - Subnet dengan tingkat keamanan tertinggi. Lapisan ini menampung *cluster* PostgreSQL dan sama sekali tidak memiliki akses internet *inbound* maupun *outbound*. Ia hanya membuka port 5432 khusus untuk IP internal yang berasal dari Backend VPC.

---

## BAB 4: INTEGRASI ARTIFICIAL INTELLIGENCE (AI)

### 4.1 Pemilihan Teknologi AI
CalorieTracker memanfaatkan **Google Gemini API** (khususnya varian model `gemini-1.5-flash` / `gemini-3.5-flash`). Model *flash* dipilih karena menawarkan keseimbangan optimal antara kecepatan latensi (sangat penting untuk respons antarmuka web) dan kemampuan analitik visi (*multimodal vision*) yang sangat akurat dalam mengenali objek dalam gambar.

### 4.2 Arsitektur Pengolahan Gambar (Base64 Bypass)
Dalam lingkungan jaringan korporat atau beberapa ISP (Internet Service Provider) tertentu, seringkali terdapat aturan ketat seperti *Deep Packet Inspection* (DPI) yang dapat memblokir *request outbound* tertentu (misalnya *traffic* API menuju layanan storage eksternal seperti R2). 

Untuk memastikan *reliability* AI Service dalam menganalisis gambar, CalorieTracker menerapkan **Arsitektur Pemrosesan Base64**:
1. Saat pengguna mengunggah gambar, Node.js Backend menyimpannya di memori sementara.
2. Backend tidak hanya mengunggah file tersebut ke Cloudflare R2 untuk penyimpanan jangka panjang, tetapi juga mengonversi gambar tersebut menjadi string `Base64`.
3. String `Base64` tersebut dikemas ke dalam *payload* JSON dan dikirimkan secara internal melalui jaringan VPC langsung ke AI Service (FastAPI).
4. AI Service membongkar *payload* JSON, mendekode `Base64` menjadi *binary data*, lalu membuat objek file *temporary* lokal di dalam *container*.
5. File lokal ini yang kemudian diumpankan langsung ke SDK `google-generativeai` untuk di- *upload* dan diinferensi oleh model Gemini.
6. Dengan arsitektur ini, AI Service tidak perlu melakukan HTTP *download outbound* ke *public bucket* R2 yang berpotensi diblokir oleh sistem firewall ISP, sehingga menjamin tingkat keberhasilan pemindaian hampir 100%.

### 4.3 Prompt Engineering
Untuk menjamin konsistensi balasan yang terstruktur dan mudah di- *parsing* oleh sistem, perintah (*prompt*) yang dikirimkan ke model Gemini dikonstruksi secara hati-hati:
*"Analyze this food image. Provide the food name and an estimated calorie count. IMPORTANT: Return the output ONLY as a raw JSON object with keys 'food_name' and 'estimated_calories' (as integer). Do not include markdown code blocks or any other text."*

---

## BAB 5: CONTAINERIZATION DAN KUBERNETES

### 5.1 Docker Containerization
Seluruh bagian dari sistem (*Frontend*, *Backend*, dan *AI Service*) dibungkus menggunakan Docker.
- **Backend Dockerfile:** Dibangun dari `node:18-alpine` untuk meminimalisir ukuran *image*. Dependensi diinstal dengan `npm install`, kemudian aplikasi dijalankan dengan `node server.js`.
- **AI Service Dockerfile:** Menggunakan `python:3.10-slim`. Library Python (seperti FastAPI, Uvicorn, Google Generative AI) diinstal melalui `requirements.txt`. Server di- *start* menggunakan uvicorn ASGI *server*.

### 5.2 Kubernetes Manifests (Implementasi Lanjutan)
Sistem ini menggunakan orkestrasi tingkat lanjut melalui manifest Kubernetes (`.yaml`) yang meliputi:

1. **Deployment:** Mendefinisikan spesifikasi spesifik dari pod, termasuk *image* yang akan digunakan, *resource limits* (untuk mencegah *container* mengonsumsi seluruh *resource node*), dan spesifikasi *Environment Variables*.
2. **Service:** Bertindak sebagai *Service Discovery* internal dan eksternal. `uascloud-backend-service` dikonfigurasi sebagai tipe `LoadBalancer` untuk meminta IP eksternal dari penyedia *cloud*, sedangkan layanan internal seperti database cukup menggunakan tipe `ClusterIP`.
3. **ConfigMap:** Memisahkan konfigurasi yang tidak sensitif dari *source code*. Nilai-nilai seperti `DB_HOST`, `DB_NAME`, dan port layanan disimpan di dalam `backend-configmap.yaml`.
4. **Secret:** Keamanan adalah prioritas utama. Kata sandi database, API Key Gemini, serta kredensial R2 AWS S3 API disimpan menggunakan objek tipe `Secret` berjenis *Opaque* dengan teknik enkripsi berbasis Base64 bawaan Kubernetes. File konfigurasi rahasia ini dimasukkan dalam daftar `.gitignore` agar tidak pernah ter-*commit* ke repositori publik.

---

## BAB 6: CI/CD PIPELINE (CONTINUOUS INTEGRATION & DEPLOYMENT)

Aplikasi CalorieTracker telah difasilitasi dengan otomasi CI/CD tingkat industri menggunakan **GitHub Actions**. Alur kerja ini tercatat dalam file `.github/workflows/cicd.yml`.

### 6.1 Fase Continuous Integration (CI)
Tujuan fase CI adalah untuk memastikan bahwa kode baru tidak merusak sistem dan *image* docker yang dihasilkan selalu *up-to-date*.
- **Pemicu (Triggers):** Terjadi setiap kali ada proses `push` ke branch utama (`main`) atau ketika ada `pull_request`.
- **Proses Build:** *Runner* GitHub akan mem- *checkout* kode sumber, mengatur *build environment* menggunakan `docker/setup-buildx-action` (mengaktifkan *build cache* agresif untuk mempercepat waktu kompilasi).
- **Proses Push:** CI akan masuk (*login*) ke Docker Hub menggunakan `DOCKER_HUB_TOKEN` yang tersimpan aman di GitHub Secrets. Selanjutnya, tiga kontainer (frontend, backend, ai-service) akan dibangun serentak dan diunggah ke *registry* publik dengan tag versi *latest* dan tag *Git SHA* (untuk referensi unik).

### 6.2 Fase Continuous Deployment (CD) ke GKE
Fase ini otomatis menggantikan aplikasi di *production* dengan versi terbaru tanpa campur tangan manusia (*zero touch deployment*).
- **Syarat Eksekusi:** Hanya dijalankan jika aksi pemicunya adalah `push` ke `main` (bukan dari *pull request* yang belum di- *merge*).
- **Autentikasi Cloud:** Menggunakan modul `google-github-actions/auth@v2` dengan `GCP_SERVICE_ACCOUNT_KEY` dari rahasia repositori untuk masuk ke Google Cloud.
- **Konfigurasi Kubeconfig:** Meminta sertifikat SSL dan *endpoint cluster* GKE terkait dengan aksi `get-gke-credentials`.
- **Inject Secrets Dinamis:** Secara otomatis menghasilkan file `backend-secret` langsung di dalam *cluster* Kubernetes secara *on-the-fly* berdasarkan nilai kredensial dari GitHub Secrets, memastikan rahasia tidak meninggalkan saluran yang aman.
- **Apply & Rolling Update:** Menerapkan modifikasi Kubernetes dari `k8s/*.yaml`, kemudian menginstruksikan Kubernetes Engine untuk melakukan `kubectl set image`, yang akan memicu proses *Rolling Update*. Fitur bawaan K8s ini akan menukar pod lama dengan pod baru secara bertahap tanpa terjadi *downtime* sedetik pun.

---

## BAB 7: MONITORING SISTEM DAN AUTOSCALING

Sebuah sistem awan yang baik harus dapat pulih dari kegagalan secara mandiri (*self-healing*) dan menyesuaikan kapasitasnya seiring naik-turunnya trafik pengunjung (*elasticity*).

### 7.1 Liveness dan Readiness Probes
Setiap komponen *deployment* (seperti backend) dilengkapi dengan konfigurasi *Probe*:
- **Liveness Probe:** Kubernetes akan memeriksa secara berkala apakah aplikasi backend masih "hidup". Jika proses Node.js mengalami *deadlock* atau macet, *probe* ini akan gagal, dan Kubernetes secara otonom akan menghancurkan pod tersebut dan membangkitkan pod pengganti yang bersih.
- **Readiness Probe:** Digunakan untuk memvalidasi apakah aplikasi sudah benar-benar siap melayani permintaan pengguna. Trafik dari Load Balancer tidak akan pernah diarahkan ke sebuah pod sampai *readiness probe*-nya merespon "OK". Ini menghindari dikirimnya trafik ke aplikasi yang masih berada dalam proses koneksi ke database.

### 7.2 Horizontal Pod Autoscaler (HPA)
CalorieTracker mendukung elastisitas melalui `HorizontalPodAutoscaler`.
- HPA dikonfigurasi pada file `backend-hpa.yaml`. Aturan yang didefinisikan adalah: *Jika rata-rata utilisasi CPU seluruh pod telah melampaui 50%, K8s secara instan akan memproduksi replika pod tambahan secara dinamis, hingga batas maksimal 5 pod (maksimal).* 
- Begitu trafik kembali mereda, algoritma pendinginan HPA akan perlahan menghancurkan pod berlebih tersebut untuk kembali ke jumlah minimal (1 pod). Hal ini menjamin operasional server yang jauh lebih efisien dan hemat biaya *billing cloud*.

---

## BAB 8: TUTORIAL DEPLOYMENT

### 8.1 Lingkungan Development Lokal (Docker Compose)
Bagi pengembang yang ingin mencoba aplikasi ini di komputer mereka sendiri, langkah-langkah berikut diterapkan:
1. Pastikan Docker Engine dan Docker Compose telah terinstal.
2. *Clone* repositori proyek dari GitHub.
3. Buat file `.env` di pangkal root proyek dengan meniru format `.env.example`, yang meliputi penempatan `GEMINI_API_KEY` dan detail S3 API Cloudflare R2.
4. Buka terminal dan eksekusi instruksi: 
   `docker-compose up --build -d`
5. Aplikasi akan menjalankan seluruh 4 kontainernya dan *port forwarding* ke *host*. Sistem dapat diuji langsung dari browser pada tautan `http://localhost:3000`.

### 8.2 Lingkungan Production Cloud (Kubernetes - GKE)
Proses penerapan sistem secara manual ke *cluster* Kubernetes di lingkungan awan (di luar otomatisasi pipeline CI/CD) dilakukan dengan protokol ketat:
1. Otentikasi dan sambungkan perangkat terminal lokal ke cluster yang dituju via `gcloud container clusters get-credentials`.
2. Validasi operasional *cluster* menggunakan:
   `kubectl get nodes`
3. Amankan *database* dan penyimpanan berkas dengan membuat K8s Secret yang membungkus seluruh token.
4. Implementasikan seluruh manifest deklaratif yang ada di direktori `/k8s`:
   `kubectl apply -f k8s/backend-configmap.yaml`
   `kubectl apply -f k8s/backend-deployment.yaml`
   `kubectl apply -f k8s/backend-service.yaml`
   `kubectl apply -f k8s/backend-hpa.yaml`
5. Pantau proses inisiasi dan ketersediaan IP eksternal dari *cloud load balancer*:
   `kubectl get pods -w`
   `kubectl get svc`
6. Akses aplikasi melalui nilai IP publik yang diberikan oleh komponen `uascloud-backend-service`.

---

## BAB 9: KESIMPULAN

Melalui pengembangan CalorieTracker, terbukti bahwa penggabungan kekuatan komputasi tingkat awan (*Cloud Computing*) dan kecerdasan buatan (*Artificial Intelligence*) dapat menghasilkan solusi pragmatis untuk tantangan kesehatan global. Aplikasi ini sukses mengimplementasikan fitur pemindaian kalori menggunakan visi komputer dengan kecepatan dan akurasi tinggi, serta berhasil mewujudkan pilar SDG 3: Kehidupan Sehat dan Sejahtera.

Lebih dari fungsionalitas aplikasinya, arsitektur dasar dari *backend* sistem ini secara sukses menerapkan paradigma komputasi awan modern (*Cloud Native*) dengan memecah fungsionalitas menjadi sekumpulan layanan mikro yang diorkestrasi secara brilian oleh Kubernetes (GKE). Strategi *multi-cloud* mencegah ketergantungan eksklusif pada satu vendor, sedangkan pengaplikasian integrasi dan penyebaran berkelanjutan (CI/CD Pipeline) via GitHub Actions menjamin aplikasi selalu pada performa puncak dengan interupsi perbaikan seminimal mungkin. Penggunaan *autoscale* (HPA) memvalidasi keefisienan arsitektur di bawah tekanan fluktuasi pengunjung yang tinggi. Secara keseluruhan, proyek ini mencerminkan sebuah infrastruktur komputasi *enterprise-grade* dengan fungsionalitas cerdas dan nilai dampak sosial yang terukur.
