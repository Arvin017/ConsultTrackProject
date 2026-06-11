# 🎙️ ConsultTrack — Consultation Recording Manager

A full-stack MERN application to manage, record, and track client consultations. Built as a submission for the **Humara Pandit Engineering Hiring Challenge**.

---

## 📋 Features

- **Authentication** — JWT-based login/register with bcrypt password hashing
- **Dashboard** — Stats overview (total, completed, upcoming, this month)
- **Consultations** — Full CRUD with filtering by status, type, date range, and text search
- **Live Audio Recording** — Record directly in browser using MediaRecorder API
- **File Uploads** — Upload pre-recorded audio/video files (up to 500MB) and attachments (PDF, images, docs)
- **Client Management** — Add, view, edit, and delete clients with full consultation history
- **Status Tracking** — Scheduled → In Progress → Completed / Cancelled / No-show
- **Follow-up Scheduling** — Set follow-up dates and notes per consultation
- **Tags** — Tag consultations for easy categorization
- **Audio Playback** — Built-in HTML5 audio player for each recording

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, date-fns, react-toastify |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcryptjs |
| File Handling | Multer (disk storage) |
| Styling | Pure CSS-in-JS (no external UI library) |

---

## 🏗️ Architecture

```
consultation-manager/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema with bcrypt
│   │   ├── Client.js         # Client profiles
│   │   └── Consultation.js   # Main consultation + recordings + attachments
│   ├── routes/
│   │   ├── auth.js           # /api/auth (login, register, me)
│   │   ├── clients.js        # /api/clients (CRUD)
│   │   ├── consultations.js  # /api/consultations (CRUD + stats)
│   │   └── recordings.js     # /api/recordings (upload, delete)
│   ├── middleware/
│   │   ├── auth.js           # JWT protect middleware
│   │   └── upload.js         # Multer config for audio + attachments
│   └── server.js             # Express app entry
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx   # Global auth state
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Consultations.jsx
│       │   ├── ConsultationDetail.jsx
│       │   ├── NewConsultation.jsx
│       │   ├── Clients.jsx
│       │   ├── ClientDetail.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── components/
│       │   └── Layout.jsx        # Sidebar + top bar
│       └── utils/
│           └── api.js            # Axios API helpers
├── AI_USAGE.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/consultation-manager.git
cd consultation-manager

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev    # Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm start     # Runs on http://localhost:3000
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Consultations
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/consultations | List with filters |
| GET | /api/consultations/stats | Dashboard stats |
| POST | /api/consultations | Create |
| GET | /api/consultations/:id | Get one |
| PUT | /api/consultations/:id | Update |
| DELETE | /api/consultations/:id | Delete |
| POST | /api/consultations/:id/attachments | Upload attachment |

### Recordings
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/recordings/:consultationId/upload | Upload recording |
| DELETE | /api/recordings/:consultationId/:recordingId | Delete recording |

### Clients
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/clients | List |
| POST | /api/clients | Create |
| GET | /api/clients/:id | Get one |
| PUT | /api/clients/:id | Update |
| DELETE | /api/clients/:id | Delete |

---

## 🚧 Assumptions

1. Each user manages their own clients and consultations (data is isolated per user)
2. Recordings are stored on local disk (`backend/uploads/`) — in production, this would be S3/GCS
3. JWT tokens expire in 7 days
4. The app is single-tenant (each consultant uses their own account)

---

## 🔮 Future Improvements

- **Cloud storage** — Replace local Multer storage with AWS S3 or Cloudinary
- **Transcription** — Integrate Whisper API to auto-transcribe recordings
- **Email reminders** — Send follow-up reminders via SendGrid/Resend
- **Calendar integration** — Sync with Google Calendar
- **Multi-tenant** — Add organization/team support
- **Mobile app** — React Native client for on-the-go recording
- **Analytics** — Charts for consultation trends, client retention, etc.
- **Export** — PDF reports per consultation

---

## 👤 Author

Arvin | arvin0386.be23@chitkara.edu.in | Chitkara University, Batch 2027
