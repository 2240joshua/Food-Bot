# app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth      import router as auth_router
from routes.user      import router as user_router
from routes.recipes   import router as recipes_router
from routes.planner   import router as planner_router
from routes.recommend import router as recommend_router
from routes import ingredient_autocomplete
app = FastAPI()

app.include_router(auth_router, prefix="", tags=["auth"])

app.include_router(user_router, prefix="/users", tags=["users"])


app.include_router(recipes_router, prefix="/recipes", tags=["recipes"])

app.include_router(planner_router, prefix="/planner", tags=["planner"])

app.include_router(recommend_router, prefix="/recommend", tags=["recommend"])

app.include_router(ingredient_autocomplete.router)

@app.get("/", tags=["root"])
def home():
    return {"message": "Welcome to Food Recommendation API"}

# 🌐 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://foodbot-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
