from sqlalchemy.orm import Session
from . import models
from . import schemas


def get_refresh_token(db: Session, refresh_token_id: int):
    return db.query(models.RefreshToken).filter(models.RefreshToken.id == refresh_token_id).first()


def get_refresh_token_by_strava_id(db: Session, strava_id: int):
    return db.query(models.RefreshToken).filter(models.RefreshToken.strava_id == strava_id).first()


def create_refresh_token(db: Session, strava_id: int, read_activity: bool, refresh_token=str):
    db_refresh_token = models.RefreshToken(strava_id=strava_id, read_activity=read_activity,
                                           refresh_token=refresh_token)
    db.add(db_refresh_token)  # corrected line
    db.commit()
    db.refresh(db_refresh_token)
    return db_refresh_token


def get_athlete_slat(db: Session, strava_id: int):
    return db.query(models.AthleteSLAT).filter(models.AthleteSLAT.strava_id == strava_id).first()


def create_athlete_slat(db: Session, token: str, read_activity: bool, expires_at: int, strava_id: int):
    db_athlete_slat = models.AthleteSLAT(token=token, read_activity=read_activity, expires_at=expires_at,
                                         strava_id=strava_id)
    db.add(db_athlete_slat)
    db.commit()
    db.refresh(db_athlete_slat)
    return db_athlete_slat


def update_AthleteSLAT(db: Session, strava_id: int, athlete_slat: schemas.AthleteSLATBase, new_refresh_token: str):
    # Fetch the RefreshToken with the given strava_id
    db_refresh_token = get_refresh_token_by_strava_id(db, strava_id=strava_id)
    if db_refresh_token is None:
        raise ValueError(f"No RefreshToken found with strava_id {strava_id}")

    # Update the refresh_token of the fetched RefreshToken
    db_refresh_token.refresh_token = new_refresh_token

    # Fetch the AthleteSLAT with the given strava_id
    db_athlete_slat = get_athlete_slat(db, strava_id=strava_id)
    if db_athlete_slat is None:
        raise ValueError(f"No AthleteSLAT found with strava_id {strava_id}")

    # Update the token and expires_at of the fetched AthleteSLAT
    db_athlete_slat.token = athlete_slat.token
    db_athlete_slat.expires_at = athlete_slat.expires_at

    # Commit the changes to the database
    db.commit()

    # Refresh the instances to update their attributes with the new data from the database
    db.refresh(db_refresh_token)
    db.refresh(db_athlete_slat)

    return db_athlete_slat


def get_activity(db: Session, activity_id: int):
    return db.query(models.Activity).filter(models.Activity.id == activity_id).first()


def create_activity(db: Session, activity: schemas.ActivityBase):
    db_activity = models.Activity(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


def get_activities_by_strava_id(db: Session, strava_id: int):
    return db.query(models.Activity).filter(models.Activity.strava_id == strava_id).all()
