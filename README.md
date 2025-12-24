# Voice2Gov - Nigerian Civic Engagement Platform

A comprehensive platform for Nigerian citizens to engage with their representatives at all levels of government - from federal senators to local councilors.

## Features

- **Find Representatives**: Search and filter representatives by chamber, state, LGA, and more
- **Voice Input**: Use voice commands to create petitions and interact with the platform
- **Know Your Rights**: AI-powered legal guidance with conversational voice interface
- **Petition System**: Create and track petitions to your representatives
- **Admin Panel**: Manage representatives, contact information, and platform settings
- **Multi-level Representation**: Support for Senators, House of Reps, Governors, State Assembly, LGA Chairmen, and LGA Councillors

## Tech Stack

### Frontend
- **Next.js 14+** (React, TypeScript)
- **Tailwind CSS** for styling
- **Supabase** for authentication and database
- **Web Speech API** for voice input/output
- **ElevenLabs API** for high-quality Nigerian text-to-speech voices
- **OpenAI API** for AI-powered features

### Backend
- **Python FastAPI** for REST API
- **SQLAlchemy** for ORM
- **PostgreSQL** (via Supabase)
- **OpenAI API** for sentiment analysis, content extraction, and legal guidance

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- OpenAI API key
- ElevenLabs API key (optional, for Nigerian voices)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MarcServe/Voice2Gov.git
cd Voice2Gov
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

Create `backend/.env`:
```env
DATABASE_URL=your_supabase_database_url
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

5. Run the development server:

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
uvicorn app.main:app --reload
```

## Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend

The backend can be deployed to:
- Railway
- Render
- Heroku
- Any Python hosting service

## Project Structure

```
Voice2Gov/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── contexts/     # React contexts
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── models/   # SQLAlchemy models
│   │   ├── routers/  # API routes
│   │   └── services/ # Business logic
│   └── requirements.txt
├── data/             # CSV and SQL seed files
└── scripts/          # Utility scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

