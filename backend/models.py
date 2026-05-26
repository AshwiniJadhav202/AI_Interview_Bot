from sqlalchemy import Column, Integer, String, JSON
from db import Base

# USER TABLE
class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    email = Column(String, unique=True)

    password = Column(String)


# INTERVIEW TABLE
class Interview(Base):

    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True)

    user_email = Column(String)

    question = Column(String)

    answer = Column(String)

    result = Column(String)