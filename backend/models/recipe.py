from sqlalchemy import Column, Integer, String, ForeignKey
from models.database import Base

class FavoriteRecipe(Base):
    __tablename__ = "favorite_recipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    spoonacular_id = Column(Integer)
    image_url = Column(String)
