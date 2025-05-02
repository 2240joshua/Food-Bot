from models.database import Base, engine
from models import user, recipe, user_meal  # ⬅️ ensures models are registered

# Create all tables defined in Base subclasses
Base.metadata.create_all(bind=engine)

print("✅ Database tables created.")
