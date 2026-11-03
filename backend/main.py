from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import Iceberg, User  
from routes import iceberg, auth
from dotenv import load_dotenv
import os

load_dotenv()


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(iceberg.router)
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "API is running"}