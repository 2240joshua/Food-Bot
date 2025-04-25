from fastapi import FastAPI
from backend.routes.recommend import router as recommend_router
from backend.routes.user import router as user_router
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.auth import router as auth_router
from backend.routes.auth import router as auth_router
app = FastAPI()


app.include_router(auth_router)
# Include API routes
app.include_router(recommend_router)
app.include_router(user_router)
app.include_router(auth_router)
@app.get("/")
def home():
    return {"message": "Welcome to Food Recommendation API"}




app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)