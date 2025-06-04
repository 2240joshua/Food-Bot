from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from models.database import SessionLocal
from models.user import User
from models.plan_entry import PlanEntry
from schemas.planner import DayPlan, FullPlan
from routes.auth import get_current_user

# Remove the prefix here—only tag
router = APIRouter(tags=["planner"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=FullPlan)
def get_full_plan(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    entries = (
        db.query(PlanEntry)
          .filter(PlanEntry.user_id == user_id)
          .order_by(PlanEntry.day, PlanEntry.order)
          .all()
    )

    plan_map: Dict[str, List[int]] = {}
    for e in entries:
        plan_map.setdefault(e.day, []).append(e.recipe_id)
    return {"plans": plan_map}


@router.post("/", response_model=FullPlan)
def save_full_plan(
    full: FullPlan,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    if not db.query(User).get(user_id):
        raise HTTPException(status_code=404, detail="User not found")

    db.query(PlanEntry).filter(PlanEntry.user_id == user_id).delete()

    to_create = []
    for day, ids in full.plans.items():
        for idx, rid in enumerate(ids):
            to_create.append(PlanEntry(
                user_id   = user_id,
                day       = day,
                recipe_id = rid,
                order     = idx
            ))
    db.bulk_save_objects(to_create)
    db.commit()

    return get_full_plan(db, current_user)


@router.delete("/{day}/{recipe_id}", response_model=FullPlan)
def remove_plan_entry(
    day: str,
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]

    deleted = (
        db.query(PlanEntry)
          .filter(
              PlanEntry.user_id   == user_id,
              PlanEntry.day       == day,
              PlanEntry.recipe_id == recipe_id
          )
          .delete()
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Entry not found")

    entries = (
        db.query(PlanEntry)
          .filter(PlanEntry.user_id == user_id, PlanEntry.day == day)
          .order_by(PlanEntry.order)
          .all()
    )
    for idx, e in enumerate(entries):
        e.order = idx
    db.commit()

    return get_full_plan(db, current_user)
