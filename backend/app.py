from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.auth    import router as auth_router
from backend.routes.user    import router as user_router
from backend.routes.recipes import router as recipes_router
from backend.routes.planner import router as planner_router
from backend.routes.recommend import router as recommend_router


app = FastAPI()


app.include_router(auth_router,     prefix="",         tags=["auth"])


app.include_router(user_router,     prefix="/users",   tags=["users"])


app.include_router(recipes_router,  prefix="/recipes", tags=["recipes"])

app.include_router(planner_router,  prefix="/planner", tags=["planner"])

app.include_router(recommend_router,prefix="/recommend", tags=["recommend"])

@app.get("/", tags=["root"])
def home():
    return {"message": "Welcome to Food Recommendation API"}

# 🌐 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
