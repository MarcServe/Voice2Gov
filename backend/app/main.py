from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import auth, representatives, petitions, social, legal

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="API for Voice2Gov - Nigerian Civic Engagement Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://voice2gov.ng",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(representatives.router, prefix="/api/representatives", tags=["Representatives"])
app.include_router(petitions.router, prefix="/api/petitions", tags=["Petitions"])
app.include_router(social.router, prefix="/api/social", tags=["Social Media"])
app.include_router(legal.router, prefix="/api/legal", tags=["Legal"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to Voice2Gov API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

