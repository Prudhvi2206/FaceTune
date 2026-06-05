# FaceTune 🎵

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.0-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.6.3-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5.0-FF4500?style=for-the-badge&logo=nextauth&logoColor=white)](https://authjs.dev/)

FaceTune is an interactive, AI-powered music companion that captures real-time facial expressions through your webcam, detects your dominant emotion, and recommends customized soundtracks matching your mood. Designed with a premium dark glassmorphic UI, it supports custom mood song bindings, listening analytics, and secure authorization.

---

## 🌟 Core Features

- **Real-Time Emotion Tracking**: Powered by client-side Google **MediaPipe Tasks Vision** detecting 7 primary emotions (*Happy, Sad, Angry, Surprised, Fearful, Disgusted, and Neutral*).
- **Smart Music Recommender**: Queries matching playlists dynamically from the decentralized **Audius API Network** and fallback **YouTube Data API**.
- **Custom Song Mapping**: Empower users to search and assign specific songs to any emotion, overriding the defaults.
- **Fixed Music Player**: Frosted glass music bar supporting playback queues, dynamic volume scaling, repeat/shuffle, and fullscreen ambient visualizers.
- **Mood Analytics**: Visual charts mapping user mood logs and listening history trends over time.
- **Secure Authentication**: Credentials and OAuth login options powered securely by **Auth.js (NextAuth v5)**.

---

## 🌐 System Architecture

FaceTune runs on a classic client-server model:

```mermaid
graph LR
    subgraph Client [Client Side]
        Webcam[Webcam Video] --> MP[MediaPipe Face Mesh]
        MP --> Classifier[Emotion Classifier]
        Classifier --> Player[Zustand Player Store]
    end
    
    subgraph Backend [Next.js API Routes]
        API_Auth[Auth Handler]
        API_Emotions[Emotions Logging]
        API_Custom[Custom Mood Maps]
        API_Music[Music Search/Trending]
    end
    
    subgraph External [External Services]
        DB[(MongoDB Atlas)]
        Audius[Audius API]
        YouTube[YouTube Data API]
    end
    
    %% Connections
    Classifier -.->|POST Log| API_Emotions
    Player -->|Favorites & Mappings| API_Custom
    Player -->|Search/Stream| API_Music
    
    API_Auth --> DB
    API_Emotions --> DB
    API_Custom --> DB
    API_Music --> Audius
    API_Music --> YouTube
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your database/OAuth secret configurations:
```properties
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/facetune
AUTH_SECRET=your_nextauth_auth_secret_string
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

### 4. Build for Production
```bash
npm run build
npm run start
```
