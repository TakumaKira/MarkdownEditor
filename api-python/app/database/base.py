import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

sqlalchemy_database_url = "mysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{DATABASE_HOST}/{MYSQL_DATABASE}".format(DATABASE_HOST=os.environ.get("DATABASE_HOST"), MYSQL_DATABASE=os.environ.get("MYSQL_DATABASE"), MYSQL_USER=os.environ.get("MYSQL_USER"), MYSQL_PASSWORD=os.environ.get("MYSQL_PASSWORD"))
print(sqlalchemy_database_url)

engine = create_engine(sqlalchemy_database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()