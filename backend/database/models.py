from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(16), unique=False, index=True, nullable=True)  # Сделано nullable
    email = Column(String(254), unique=True, index=True, nullable=False)
    data_users = Column(JSONB, nullable=False)
    password = Column(String(255), nullable=False)

class Hero(Base):
    __tablename__ = 'heroes'
    __table_args__ = {'schema': 'public'}

    hero_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64))
    role = Column(String(32))
    ability = Column(JSONB)
    base_health = Column(Integer)
    speed = Column(Integer)
    gender = Column(String(16))

class BetterResult(Base):
    __tablename__ = 'better_results'
    __table_args__ = {'schema': 'public'}

    result_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('public.users.id', ondelete="CASCADE"))
    score = Column(Integer, nullable=False)
    level_reached = Column(Integer, default=1)
    date_played = Column(TIMESTAMP, server_default=func.now())

class Setting(Base):
    __tablename__ = 'settings'
    __table_args__ = (
        CheckConstraint('sound_volume BETWEEN 0 AND 100'),
        CheckConstraint('music_volume BETWEEN 0 AND 100'),
        {'schema': 'public'}
    )

    user_id = Column(Integer, ForeignKey('public.users.id', ondelete="CASCADE"), primary_key=True)
    sound_volume = Column(Integer, default=100)
    music_volume = Column(Integer, default=100)
    control_scheme = Column(String(32), default='default')

class ResultsHistory(Base):
    __tablename__ = 'results_history'
    __table_args__ = {'schema': 'public'}

    history_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('public.users.id', ondelete="CASCADE"))
    score = Column(Integer, nullable=False)
    recorded_at = Column(TIMESTAMP, server_default=func.now())