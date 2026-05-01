from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import Iceberg, User  # ensures tables are registered
from routes import iceberg, auth
from dotenv import load_dotenv
import os

load_dotenv()

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(iceberg.router)
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "API is running"}