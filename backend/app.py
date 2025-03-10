from fastapi import FastAPI
from backend.routes import recommend

app = FastAPI()

# Include API routes
app.include_router(recommend.router)

@app.get("/")
def home():
    return {"message": "Welcome to Food Recommendation API"}
