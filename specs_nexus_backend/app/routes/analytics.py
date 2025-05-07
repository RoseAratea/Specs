import logging
from datetime import datetime, timedelta
from typing import Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models, schemas

logger = logging.getLogger("app.analytics")

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint: GET /analytics/dashboard
# This endpoint gathers and returns data for the dashboard.
# It provides:
# - Membership insights: counts of paid, active, and inactive members.
# - Payment analytics: details on payment statuses and popular payment methods.
# - Event engagement: details on events, participation rates, and popular events.
# - Clearance tracking: status breakdown by requirement and user year.
@router.get("/dashboard", response_model=dict)
def get_dashboard_data(db: Session = Depends(get_db)) -> Dict[str, Any]:
    logger.debug("Starting dashboard data aggregation")
    
    # Count distinct users with a clearance record marked as "Paid"
    total_paid_members = db.query(models.Clearance.user_id).filter(
        models.Clearance.archived == False,
        models.Clearance.payment_status == "Paid"
    ).distinct().count()
    logger.debug(f"Total paid members: {total_paid_members}")

    # Count distinct paid members per membership requirement
    members_by_requirement_raw = db.query(
        models.Clearance.requirement,
        func.count(func.distinct(models.Clearance.user_id))
    ).filter(
        models.Clearance.archived == False,
        models.Clearance.payment_status == "Paid"
    ).group_by(models.Clearance.requirement).all()
    members_by_requirement = {req: count for req, count in members_by_requirement_raw}
    logger.debug(f"Members by requirement: {members_by_requirement}")

    # Active members are those whose last activity was within the past 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    active_members = db.query(models.User.id).join(models.Clearance, models.Clearance.user_id == models.User.id).filter(
        models.Clearance.archived == False,
        models.Clearance.payment_status == "Paid",
        models.User.last_active >= thirty_days_ago
    ).distinct().count()
    inactive_members = total_paid_members - active_members
    logger.debug(f"Active members: {active_members}, Inactive members: {inactive_members}")

    # Get counts for each payment status
    not_paid_count = db.query(models.Clearance).filter(
        models.Clearance.archived == False, 
        models.Clearance.payment_status == "Not Paid"
    ).count()
    verifying_count = db.query(models.Clearance).filter(
        models.Clearance.archived == False, 
        models.Clearance.payment_status == "Verifying"
    ).count()
    paid_count = db.query(models.Clearance).filter(
        models.Clearance.archived == False, 
        models.Clearance.payment_status == "Paid"
    ).count()
    logger.debug(f"Payment Analytics - Not Paid: {not_paid_count}, Verifying: {verifying_count}, Paid: {paid_count}")
    
    # Count how many times each payment method is used (ignoring nulls)
    payment_methods = db.query(
        models.Clearance.payment_method, 
        func.count(models.Clearance.id)
    ).filter(
        models.Clearance.archived == False,
        models.Clearance.payment_method.isnot(None)
    ).group_by(models.Clearance.payment_method).all()
    preferred_payment_methods = [{"method": method, "count": count} for method, count in payment_methods]
    logger.debug(f"Preferred payment methods: {preferred_payment_methods}")

    # Get payment details grouped by requirement and user's year
    payment_by_req_year_raw = db.query(
        models.User.year,
        models.Clearance.requirement,
        models.Clearance.payment_status,
        func.count(models.Clearance.id)
    ).join(models.Clearance, models.Clearance.user_id == models.User.id)\
     .filter(models.Clearance.archived == False)\
     .group_by(models.User.year, models.Clearance.requirement, models.Clearance.payment_status)\
     .all()
    
    byRequirementAndYear = {}
    for user_year, requirement, payment_status, count in payment_by_req_year_raw:
        if not user_year:
            user_year = "Unspecified"
        if requirement not in byRequirementAndYear:
            byRequirementAndYear[requirement] = {}
        if user_year not in byRequirementAndYear[requirement]:
            byRequirementAndYear[requirement][user_year] = {"Not Paid": 0, "Verifying": 0, "Paid": 0}
        byRequirementAndYear[requirement][user_year][payment_status] = count
    logger.debug(f"Payment details by requirement and year: {byRequirementAndYear}")

    # Get event details and calculate participation rates
    events = db.query(models.Event).filter(models.Event.archived == False).all()
    events_engagement = []
    events_by_year = {}
    for event in events:
        event_year = event.date.year if event.date else "Unknown"
        engagement = {
            "title": event.title,
            "participant_count": event.participant_count,
            "participation_rate": round((event.participant_count / total_paid_members)*100, 2) if total_paid_members > 0 else 0
        }
        events_engagement.append(engagement)
        if event_year not in events_by_year:
            events_by_year[event_year] = []
        events_by_year[event_year].append(engagement)
    popular_events = sorted(events_engagement, key=lambda x: x["participant_count"], reverse=True)
    logger.debug(f"Event engagement: {events_engagement}")

    # Group clearance records by requirement and status
    clearance_by_requirement_raw = db.query(
        models.Clearance.requirement,
        models.Clearance.status,
        func.count(models.Clearance.id)
    ).filter(models.Clearance.archived == False)\
     .group_by(models.Clearance.requirement, models.Clearance.status)\
     .all()
    clearance_tracking = {}
    for requirement, status, count in clearance_by_requirement_raw:
        if requirement not in clearance_tracking:
            clearance_tracking[requirement] = {}
        clearance_tracking[requirement][status] = count
    logger.debug(f"Clearance tracking: {clearance_tracking}")

    # Group clearance statuses by user's year for compliance data
    compliance_by_year = db.query(
        models.User.year,
        models.Clearance.status,
        func.count(models.Clearance.id)
    ).join(models.Clearance, models.Clearance.user_id == models.User.id)\
     .filter(models.Clearance.archived == False)\
     .group_by(models.User.year, models.Clearance.status).all()
    
    compliance = {}
    for year, status, count in compliance_by_year:
        year = year or "Unspecified"
        if year not in compliance:
            compliance[year] = {}
        compliance[year][status] = count
    logger.debug(f"Compliance by year: {compliance}")

    logger.info("Dashboard data aggregated successfully")
    return {
        "membershipInsights": {
            "totalPaidMembers": total_paid_members,
            "activeMembers": active_members,
            "inactiveMembers": inactive_members,
            "membersByRequirement": members_by_requirement
        },
        "paymentAnalytics": {
            "byRequirementAndYear": byRequirementAndYear,
            "notPaid": not_paid_count,
            "verifying": verifying_count,
            "paid": paid_count,
            "preferredPaymentMethods": preferred_payment_methods
        },
        "eventsEngagement": {
            "events": events_engagement,
            "popularEvents": popular_events,
            "breakdownByYear": events_by_year
        },
        "clearanceTracking": {
            "byRequirement": clearance_tracking,
            "complianceByYear": compliance
        }
    }
