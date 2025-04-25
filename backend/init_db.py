from models.database import Base, engine
from models import user, recipe  

# Create all tables defined in Base subclasses
Base.metadata.create_all(bind=engine)

print("✅ Database tables created.")
