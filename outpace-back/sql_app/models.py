from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, BigInteger, ARRAY, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from database import Base


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



