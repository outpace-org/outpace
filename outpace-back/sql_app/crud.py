from typing import Optional, List

from sqlalchemy.orm import Session, joinedload
from . import models
from . import schemas


def get_refresh_token(db: Session, refresh_token_id: int):
    return db.query(models.RefreshToken).filter(models.RefreshToken.id == refresh_token_id).first()


def get_refresh_token_by_strava_id(db: Session, strava_id: int):
    return db.query(models.RefreshToken).filter(models.RefreshToken.strava_id == strava_id).first()


def create_refresh_token(db: Session, strava_id: int, read_activity: bool, refresh_token: str):
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


def update_AthleteSLAT(db: Session, strava_id: int, athlete_slat: schemas.AthleteSLATUpdate):
    # Fetch the RefreshToken with the given strava_id
    db_refresh_token = get_refresh_token_by_strava_id(db, strava_id=strava_id)
    if db_refresh_token is None:
        raise ValueError(f"No RefreshToken found with strava_id {strava_id}")

    # Update the refresh_token of the fetched RefreshToken
    db_refresh_token.refresh_token = athlete_slat.new_refresh_token

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


def create_dashboard(db: Session, strava_id: int):
    db_dash = models.Dashboard(strava_id=strava_id)
    db.add(db_dash)
    db.commit()
    db.refresh(db_dash)
    return db_dash


def update_dashboard(db: Session, dashboard_id: int, ready: bool):
    db_dash = db.query(models.Dashboard).filter(models.Dashboard.id == dashboard_id).first()
    if db_dash is None:
        return None
    db_dash.ready = ready
    db.commit()
    return db_dash


def get_dashboard(db: Session, strava_id: int):
    return db.query(models.Dashboard).filter(models.Dashboard.strava_id == strava_id).first()


def get_dashboard_by_token(db: Session, token: str):
    return db.query(models.Dashboard).filter(models.Dashboard.token == token).first()


def get_activities_by_strava_id(db: Session, strava_id: int, exclude: Optional[List[int]] = None):
    query = db.query(models.Activity).filter(models.Activity.strava_id == strava_id)
    if exclude:
        query = query.filter(~models.Activity.id.in_(exclude))
    activities = query.order_by(models.Activity.start_date).all()
    return activities


def get_pinned_activities_by_strava_id(db: Session, strava_id: int):
    return db.query(models.Activity).filter(models.Activity.strava_id == strava_id, models.Activity.pinned)


def get_last_activity_timestamp_by_strava_id(db: Session, strava_id: int):
    return (db.query(models.Activity.start_date)
            .filter(models.Activity.strava_id == strava_id)
            .order_by(models.Activity.start_date.desc())
            .first())


def create_trip(db: Session, trip: schemas.TripCreate):
    db_trip = models.Trip(strava_id=trip.strava_id, start=trip.start, end=trip.end)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    for activity_id in trip.activities_id:
        db_activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
        if db_activity is not None:
            db_activity.trip_id = db_trip.id
    db.commit()
    return db_trip


def add_activity_to_trip(db: Session, trip_id: int, activity_id: int):
    db_activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if db_activity is None:
        return None
    db_activity.trip_id = trip_id
    db.commit()
    return db_activity


def remove_activity_from_trip(db: Session, trip_id: int, activity_id: int):
    db_activity = db.query(models.Activity).filter(models.Activity.id == activity_id,
                                                   models.Activity.trip_id == trip_id).first()
    if db_activity is None:
        return None
    db_activity.trip_id = None
    db.commit()
    return db_activity


def delete_trip(db: Session, trip_id: int):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None:
        return None
    db.delete(db_trip)
    db.commit()
    return db_trip


def get_trips_by_strava_id(db: Session, strava_id: int):
    return (db.query(models.Trip).join(models.Activity).filter(models.Trip.strava_id == strava_id)
            .order_by(models.Activity.start_date).all())


def update_activity(db: Session, activity_id: int):
    db_activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if db_activity is None:
        return None
    db_activity.pinned = True
    db.commit()
    return db_activity


def unpin_activities(db, strava_id):
    db_activities = db.query(models.Activity).filter(models.Activity.strava_id == strava_id).all()
    for activity in db_activities:
        activity.pinned = False
    db.commit()
    return db_activities
