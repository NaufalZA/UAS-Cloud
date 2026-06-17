// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Multer untuk menerima file gambar sementara di server
const upload = multer({ dest: 'uploads/' });

// Konfigurasi Cloudflare R2 (Syarat Multi-Cloud 10%)
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

// Konfigurasi Database PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'nops_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nops_db',
    password: process.env.DB_PASSWORD || 'NopsPassword123!',
    port: 5432,
});

// --- Endpoint Utama: Upload & Analisis Kalori ---
app.post('/api/analyze-food', upload.single('foodImage'), async (req, res) => {
    const file = req.file;
    try {
        if (!file) return res.status(400).json({ error: "Gambar tidak ditemukan" });

        // 1. Upload ke Cloudflare R2
        const fileStream = fs.createReadStream(file.path);
        const fileName = `food_${Date.now()}_${file.originalname}`;
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: fileStream,
            ContentType: file.mimetype
        }));

        const publicImageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

        // 2. Baca file lokal & kirim sebagai base64 ke AI Service
        //    (Menghindari masalah ISP blocking saat AI Service download dari R2)
        const imageBase64 = fs.readFileSync(file.path).toString('base64');
        const mimeType = file.mimetype;

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:5000/estimate-calorie';
        const aiResponse = await axios.post(aiServiceUrl, {
            image_base64: imageBase64,
            mime_type: mimeType,
            image_url: publicImageUrl  // dikirim juga untuk referensi/log
        });

        // Asumsi AI membalas: {"status": "success", "data": '{"food_name": "Nasi", "estimated_calories": 200}'}
        const aiData = JSON.parse(aiResponse.data.data);

        // 3. Simpan ke Database
        const query = 'INSERT INTO meal_logs (food_name, calories, image_url) VALUES ($1, $2, $3) RETURNING *';
        const values = [aiData.food_name, aiData.estimated_calories, publicImageUrl];
        const dbResult = await pool.query(query, values);

        res.json({ success: true, data: dbResult.rows[0] });

    } catch (error) {
        console.error("Error Processing Food:", error);
        res.status(500).json({ error: "Gagal memproses gambar makanan" });
    } finally {
        // Hapus file sementara selalu, walau error
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    }
});

// --- Endpoint History: Ambil semua log ---
app.get('/api/history', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM meal_logs ORDER BY id DESC LIMIT 50'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Gagal mengambil riwayat' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Nops Backend berjalan di port ${PORT}`);
});
