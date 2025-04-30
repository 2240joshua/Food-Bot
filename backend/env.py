# backend/env.py
import os
from dotenv import load_dotenv
from pathlib import Path

# Load from .env (1 level above this file)
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")
BASE_URL = os.getenv("BASE_URL")

if not SPOONACULAR_API_KEY:
    raise RuntimeError("❌ Missing SPOONACULAR_API_KEY in .env")
