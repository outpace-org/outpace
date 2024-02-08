from typing import List

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, BigInteger, ARRAY, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    strava_id = Column(Integer, unique=True)
    refresh_token = Column(String)
    read_activity = Column(Boolean)
    slat = relationship("AthleteSLAT", back_populates="refresher")


class AthleteSLAT(Base):
    __tablename__ = "athlete_slats"
    id = Column(BigInteger, primary_key=True, index=True)
    token = Column(String)
    read_activity = Column(Boolean)
    expires_at = Column(Integer)
    strava_id = Column(Integer, ForeignKey("refresh_tokens.strava_id"))
    refresher = relationship("RefreshToken", back_populates="slat")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(BigInteger, primary_key=True, index=True)
    strava_id = Column(Integer, ForeignKey("refresh_tokens.strava_id"))
    trip_id = Column(BigInteger, ForeignKey("trips.id"))
    total_elevation_gain = Column(Float)
    elapsed_time = Column(Integer)
    name = Column(String)
    distance = Column(Float)
    start_latlng = Column(ARRAY(Float))
    end_latlng = Column(ARRAY(Float))
    start_date = Column(DateTime)
    type = Column(String)
    summary_polyline = Column(String)
    country = Column(String, default="France")
    trip = relationship("Trip", back_populates="activities")
    pinned = Column(Boolean, default=False)


class Trip(Base):
    __tablename__ = "trips"

    id = Column(BigInteger, primary_key=True, index=True)
    strava_id = Column(Integer, ForeignKey("refresh_tokens.strava_id"))
    start = Column(String)
    end = Column(String)
    activities = relationship("Activity", back_populates="trip")


class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(BigInteger, primary_key=True, index=True)
    strava_id = Column(Integer, ForeignKey("refresh_tokens.strava_id"))
    ready = Column(Boolean, default=False)
