import logging
import logging.config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app import models
from app.routes import auth, clearance, membership, events, announcements, officers, analytics, chat

logging.config.fileConfig('app/logging.conf', disable_existing_loggers=False)

app = FastAPI(title="SPECS Nexus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(auth.router)
app.include_router(clearance.router)
app.include_router(membership.router)
app.include_router(events.router)
app.include_router(announcements.router)
app.include_router(officers.router)
app.include_router(analytics.router)
app.include_router(chat.router)

models.Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "Welcome to SPECS Nexus API"}
