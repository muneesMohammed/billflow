from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/letterhead", tags=["letterhead"])


@router.get("")
def get_letterhead(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    lh = db.query(models.LetterheadSetting).filter(models.LetterheadSetting.id == "default").first()
    if not lh:
        return {"settings": None}
    return {"settings": lh.settings}


@router.put("")
def update_letterhead(
    data: schemas.LetterheadUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    lh = db.query(models.LetterheadSetting).filter(models.LetterheadSetting.id == "default").first()
    if lh:
        lh.settings = data.settings
    else:
        lh = models.LetterheadSetting(id="default", settings=data.settings)
        db.add(lh)
    db.commit()
    return {"ok": True}
