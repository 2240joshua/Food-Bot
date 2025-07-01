# 🍽️ FoodBot – Meal Planning & Recipe Recommendation App

FoodBot is a full-stack web app for managing recipes, planning weekly meals, and getting smart recipe recommendations based on your preferences and ingredients.  
**Backend:** FastAPI (Python) | **Frontend:** React | **DB:** PostgreSQL | **Ingredient Data:** Spoonacular API

---

## Features

- User registration & login (JWT Auth)
- Personal recipe management – Add, edit, delete your own recipes
- Meal planner – Plan recipes for each day of the week
- Automatic nutrition calculation (calories, macros per recipe)
- Ingredient autocomplete (Spoonacular API)
- Explore public recipes
- Personalized recommendations (by ingredient, cuisine, diet)

---

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, python-jose, passlib
- **Frontend:** React (create-react-app)
- **Auth:** JWT (OAuth2), bcrypt
- **3rd Party:** Spoonacular API

.\venv\Scripts\Activate.ps1
cd backend
uvicorn app:app --reload

cd frontend
npm run build
npm start
