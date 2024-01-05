from typing import List
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select, func
from . import crud, models, schemas
from .database import SessionLocal, engine
from haversine import haversine
from fastapi.middleware.cors import CORSMiddleware
from geopy.geocoders import Nominatim


models.Base.metadata.create_all(bind=engine)

app = FastAPI()


origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

geolocator = Nominatim(user_agent="outpace")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register_token/", response_model=schemas.AthleteSLAT)
def register_token_token(token_registration: schemas.TokenRegistration, db: Session = Depends(get_db)):
    strava_id=token_registration.athlete.id
    db_refresh_token = crud.get_refresh_token_by_strava_id(db, strava_id=strava_id)
    if db_refresh_token:
        raise HTTPException(status_code=400, detail="Strava ID already registered")
    crud.create_refresh_token(db=db, strava_id=strava_id, read_activity=True, refresh_token=token_registration.refresh_token)
    return crud.create_athlete_slat(db=db, token=token_registration.access_token, read_activity=True, strava_id=strava_id, expires_at=token_registration.expires_at)


@app.get("/refresh_token/{refresh_token_id}", response_model=schemas.RefreshToken)
def read_refresh_token(refresh_token_id: int, db: Session = Depends(get_db)):
    db_refresh_token = crud.get_refresh_token(db, refresh_token_id=refresh_token_id)
    if db_refresh_token is None:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return db_refresh_token

@app.get("/refresh_token_strava/{strava_id}", response_model=schemas.RefreshToken)
def read_refresh_token_strava(strava_id: int, db: Session = Depends(get_db)):
    db_refresh_token = crud.get_refresh_token(db, strava_id=strava_id)
    if db_refresh_token is None:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return db_refresh_token

@app.get("/refresh_token/{strava_id}/AthleteSLAT/", response_model=schemas.AthleteSLATBase)
def read_AthleteSLAT(
    strava_id: int, db: Session = Depends(get_db)
):
    db_refresh_token = crud.get_refresh_token_by_strava_id(db, strava_id=strava_id)
    if db_refresh_token is None:
        raise HTTPException(status_code=404, detail="RefreshToken not found")
    return crud.get_athlete_slat(db=db, strava_id=strava_id)

@app.put("/refreshtoken/{strava_id}/AthleteSLAT/", response_model=schemas.AthleteSLATBase)
def update_token(
    strava_id: int, athlete_slat: schemas.AthleteSLATBase, new_refresh_token: str, db: Session = Depends(get_db)
):
    db_refresh_token = crud.get_refresh_token_by_strava_id(db, strava_id=strava_id)
    if db_refresh_token is None:
        raise HTTPException(status_code=404, detail="RefreshToken not found")
    return crud.update_AthleteSLAT(db=db, strava_id=strava_id, athlete_slat=athlete_slat, new_refresh_token=new_refresh_token)

    
@app.post("/activities/", response_model=List[schemas.Activity])
def add_activities(activities: List[schemas.ActivityCreate], db: Session = Depends(get_db)):
    db_activities = []
    for activity in activities:
        db_refresh_token = crud.get_refresh_token_by_strava_id(db, strava_id=activity.athlete.id)
        if db_refresh_token is None:
            raise HTTPException(status_code=404, detail="RefreshToken not found")
        db_activity = crud.get_activity(db, activity_id=activity.id)
        if db_activity:
            raise HTTPException(status_code=400, detail="Activity ID already registered")
        if activity.type in ["Run", "Ride"]:
            location = geolocator.reverse(f"{activity.start_latlng[0]},{activity.start_latlng[1]}")
            activity_cpy = schemas.ActivityBase(id=activity.id, strava_id=activity.athlete.id,total_elevation_gain=activity.total_elevation_gain,
                                                elapsed_time=activity.elapsed_time, name=activity.name, distance=activity.distance, 
                                                start_latlng=activity.start_latlng, end_latlng=activity.end_latlng,start_date=activity.start_date, 
                                                type=activity.type, summary_polyline=activity.map.summary_polyline, 
                                                country=location.raw['address']['country'])
            db_activity = crud.create_activity(db, activity_cpy)
            db_activities.append(db_activity)
    db.commit()
    return db_activities

@app.get("/activities/{strava_id}", response_model=List[schemas.Activity])
def read_activities(strava_id: int, db: Session = Depends(get_db)):
    activities = crud.get_activities_by_strava_id(db, strava_id)
    if activities is None:
        raise HTTPException(status_code=404, detail="Activities not found")
    return activities

@app.get("/activities/elevation/{strava_id}/{elevation}", response_model=List[schemas.Activity])
def get_activities_with_elevation(strava_id: int, elevation: int, db: Session = Depends(get_db)):
    # Define the 'ordered_elevation' CTE
    ordered_elevation = select([
        models.Activity,
        func.sum(models.Activity.total_elevation_gain).over(order_by=(models.Activity.total_elevation_gain / models.Activity.distance).desc()).label('running_total')
    ]).where(models.Activity.strava_id == strava_id).cte('ordered_elevation')

    # Alias the CTE to use it in the next query
    OrderedElevation = aliased(ordered_elevation)

    # Define the 'minimal_set' CTE
    minimal_set = select([
        OrderedElevation
    ]).select_from(OrderedElevation).where(OrderedElevation.c.running_total - OrderedElevation.c.total_elevation_gain < elevation).cte('minimal_set')

    # Alias the CTE to use it in the final query
    MinimalSet = aliased(minimal_set)

    # Define the final query
    final_query = select([
        MinimalSet
    ])

    # Execute the final query
    result = db.execute(final_query)

    # Fetch all results
    activities = result.fetchall()

    # Return the results as a list of dictionaries
    return [dict(row) for row in activities]

def is_trip(activities):
    if len(activities) < 3:
        return False
    for i in range(1, len(activities)):
        start = activities[i].start_latlng
        end = activities[i - 1].end_latlng
        start_date = activities[i].start_date
        end_date = activities[i - 1].start_date
        if haversine(start, end) > 10 or (start_date - end_date).days > 7:
            return False
    return True

def find_trips(activities):
    trips = []
    for i in range(len(activities)):
        for j in range(len(activities) + 2, i + 2, -1):
            trip = activities[i:j]
            if is_trip(trip) and not any(set(trip).issubset(set(larger_trip)) for larger_trip in trips):
                trips.append(trip)
                break
    
    return trips

@app.get("/trips/{strava_id}", response_model=List[List[schemas.Activity]])
async def get_trips(strava_id: int, db: Session = Depends(get_db)):
    activities = db.query(models.Activity).filter(models.Activity.strava_id == strava_id, models.Activity.distance > 65000).order_by(models.Activity.start_date).all()
    trips = find_trips(activities)
    return trips



