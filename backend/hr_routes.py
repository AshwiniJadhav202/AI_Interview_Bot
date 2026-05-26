from fastapi import APIRouter, Depends
from db import SessionLocal
from models import Interview

router = APIRouter()

@router.get("/hr/candidates")
def get_candidates():
    db = SessionLocal()
    return db.query(Interview).all()