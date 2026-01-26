# 📸 Face Verification Attendance System

Sistem absensi karyawan dengan verifikasi wajah menggunakan **Golang backend** dan **React frontend**.

## 🎯 Fitur Utama

- ✅ **Registrasi Karyawan** dengan foto wajah referensi
- ✅ **Check-In dengan Face Verification** menggunakan webcam
- ✅ **Dashboard** dengan statistik dan riwayat absensi
- ✅ **RESTful API** dengan dokumentasi lengkap
- ✅ **Responsive UI** dengan Tailwind CSS

## 🏗️ Arsitektur Sistem

### Backend (Golang)
- **Framework**: Fiber (high-performance web framework)
- **ORM**: GORM dengan PostgreSQL
- **Face Recognition**: Image hashing algorithm (perceptual + average + difference hash)
- **Architecture**: Clean Architecture / Standard Go Project Layout

### Frontend (React)
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **API Client**: Axios
- **Webcam**: react-webcam

## 📁 Struktur Folder

```
APKabsensi dhimas test/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go           # Entry point server
│   ├── internal/
│   │   ├── config/
│   │   │   ├── config.go         # Configuration loader
│   │   │   └── database.go       # Database connection
│   │   ├── models/
│   │   │   ├── user.go           # User model
│   │   │   └── attendance.go     # Attendance model
│   │   ├── services/
│   │   │   └── face_service.go   # Face verification logic
│   │   ├── handlers/
│   │   │   ├── user_handler.go       # User endpoints
│   │   │   ├── attendance_handler.go # Attendance endpoints
│   │   │   └── health_handler.go     # Health check
│   │   ├── routes/
│   │   │   └── routes.go         # Router setup
│   │   └── utils/
│   │       ├── file_handler.go   # File upload utilities
│   │       └── response.go       # API response helpers
│   ├── uploads/                  # Uploaded images storage
│   ├── go.mod
│   ├── go.sum
│   └── .env                      # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── WebcamCapture.jsx # Reusable webcam component
    │   ├── pages/
    │   │   ├── Home.jsx          # Dashboard
    │   │   ├── EmployeeRegistration.jsx
    │   │   └── CheckIn.jsx       # Check-in page
    │   ├── services/
    │   │   └── api.js            # API service
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # Entry point
    │   └── index.css             # Global styles
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🚀 Instalasi dan Setup

### Prerequisites

- **Go** 1.21 atau lebih tinggi ([Download](https://golang.org/dl/))
- **Node.js** 18+ dan npm ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))

### 1. Setup Database

```bash
# Masuk ke PostgreSQL
psql -U postgres

# Buat database baru
CREATE DATABASE attendance_db;

# Keluar dari psql
\q
```

### 2. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Copy environment variables
copy .env.example .env

# Edit .env dan sesuaikan dengan konfigurasi database Anda
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=attendance_db

# Download dependencies
go mod download

# Jalankan server
go run cmd/server/main.go
```

Backend akan berjalan di `http://localhost:8080`

### 3. Setup Frontend

```bash
# Buka terminal baru, masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Employees
- `POST /api/employees/register` - Register karyawan baru
  - Form data: `name`, `email`, `phone`, `face_image` (file)
- `GET /api/employees` - Get semua karyawan
- `GET /api/employees/:id` - Get karyawan by ID

### Attendance
- `POST /api/attendance/checkin` - Check-in dengan face verification
  - Form data: `user_id`, `selfie_image` (file)
- `GET /api/attendance` - Get riwayat absensi
  - Query: `user_id` (optional), `limit` (optional)
- `GET /api/attendance/today/:user_id` - Get absensi hari ini untuk user

### Static Files
- `GET /uploads/*` - Serve uploaded images

## 🔍 Cara Kerja Face Verification

### Algoritma yang Digunakan

Sistem ini menggunakan **Image Hashing** dengan tiga jenis hash:

1. **Perceptual Hash (pHash)**: Robust terhadap minor changes
2. **Average Hash (aHash)**: Cepat dan efisien
3. **Difference Hash (dHash)**: Deteksi gradient changes

### Proses Verifikasi

```
1. Registrasi:
   Input: Face Image → Extract Hash → Save to DB

2. Check-In:
   Input: Selfie → Extract Hash → Compare dengan DB
   
3. Comparison:
   - Hitung Hamming Distance untuk setiap hash
   - Average distance dari 3 hash types
   - Convert ke Similarity Score (0.0 - 1.0)
   - Match jika score ≥ threshold (default: 0.6)
```

### Kelebihan & Kekurangan

#### ✅ Kelebihan
- Pure Go, tidak perlu external dependencies berat
- Cepat dan ringan
- Cocok untuk demo/prototype
- Mudah di-upgrade ke API eksternal

#### ❌ Kekurangan
- Bukan real face recognition (hanya image similarity)
- Tidak detect face landmarks
- Kurang akurat dibanding deep learning models
- Rentan terhadap pose/lighting changes

### 🔄 Upgrade Path (Production)

Untuk production, disarankan menggunakan:

**Option 1: External API**
- AWS Rekognition
- Face++ API
- Azure Face API
- Google Cloud Vision API

**Option 2: Python Microservice**
- Deploy Python service dengan `face_recognition` library
- Go backend call via HTTP/gRPC
- Return 128-d atau 512-d face embeddings
- Hitung Euclidean distance

## 🎨 Screenshots

### Dashboard
![Dashboard](./docs/screenshot-home.png)

### Registrasi Karyawan
![Register](./docs/screenshot-register.png)

### Check-In
![Check-In](./docs/screenshot-checkin.png)

## 🧪 Testing

### Manual Testing

1. **Test Registrasi**:
   - Buka `http://localhost:3000/register`
   - Isi form dan ambil foto
   - Submit dan cek database

2. **Test Check-In**:
   - Buka `http://localhost:3000/checkin`
   - Pilih employee
   - Ambil selfie
   - Verifikasi hasil matching

3. **Test API dengan cURL**:

```bash
# Health check
curl http://localhost:8080/api/health

# Get all employees
curl http://localhost:8080/api/employees

# Register employee
curl -X POST http://localhost:8080/api/employees/register \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=081234567890" \
  -F "face_image=@path/to/photo.jpg"
```

## 🐳 Docker (Optional)

File `docker-compose.yml` tersedia untuk setup PostgreSQL:

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop
docker-compose down
```

## ⚙️ Konfigurasi

### Backend (.env)

```env
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=attendance_db
DB_SSLMODE=disable
UPLOAD_PATH=./uploads
FACE_SIMILARITY_THRESHOLD=0.6
```

### Frontend (vite.config.js)

```js
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

## 🛠️ Development

### Backend

```bash
# Install dependencies
go mod download

# Run with hot reload (install air first)
go install github.com/cosmtrek/air@latest
air

# Build binary
go build -o attendance-server cmd/server/main.go

# Run tests
go test ./...
```

### Frontend

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR | Employee name |
| email | VARCHAR | Email (unique) |
| phone | VARCHAR | Phone number |
| face_image_path | VARCHAR | Path to reference photo |
| face_descriptor | TEXT | Face embedding/hash (JSON) |
| created_at | TIMESTAMP | Registration time |
| updated_at | TIMESTAMP | Last update |

### Attendances Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | Foreign key to users |
| check_in_time | TIMESTAMP | Check-in time |
| face_image_path | VARCHAR | Path to selfie |
| similarity_score | FLOAT | Match confidence (0.0-1.0) |
| status | VARCHAR | success/failed |
| created_at | TIMESTAMP | Record creation time |

## 🤝 Kontribusi

Silakan fork repository ini dan submit pull request untuk perbaikan atau fitur baru.

## 📄 License

MIT License

## 👨‍💻 Author

Dibuat sebagai demo sistem absensi dengan face verification menggunakan Golang dan React.

## 📞 Support

Jika ada pertanyaan atau masalah:
- Buka issue di GitHub
- Email: support@example.com

---

**Happy Coding! 🚀**
