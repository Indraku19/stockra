from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import stock

load_dotenv()

app = FastAPI(
    title="Stockra API",
    description="AI-powered stock analysis backend",
    version="1.0.0",
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(stock.router)


@app.get("/health")
def health():
    return {"status": "ok", "app": "Stockra API"}
