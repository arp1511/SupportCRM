import sys
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, Base, engine
from app.models import Ticket, Note, User
from app.services import auth_service


def seed_db() -> None:
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Seed Users (Admins and Customers) if they don't exist
        users_to_create = [
            {
                "email": "admin@crm.com",
                "password": "admin123",
                "full_name": "System Administrator",
                "role": "admin"
            },
            {
                "email": "sconnor@cyberdyne.com",
                "password": "sconnor123",
                "full_name": "Sarah Connor",
                "role": "customer"
            },
            {
                "email": "tony@starkindustries.com",
                "password": "tony123",
                "full_name": "Tony Stark",
                "role": "customer"
            },
            {
                "email": "hulk@avengers.org",
                "password": "banner123",
                "full_name": "Bruce Banner",
                "role": "customer"
            }
        ]

        seeded_new_users = False
        for u_item in users_to_create:
            existing_user = db.query(User).filter(User.email == u_item["email"]).first()
            if not existing_user:
                hashed_pwd = auth_service.get_password_hash(u_item["password"])
                user = User(
                    email=u_item["email"],
                    hashed_password=hashed_pwd,
                    full_name=u_item["full_name"],
                    role=u_item["role"]
                )
                db.add(user)
                seeded_new_users = True
        
        if seeded_new_users:
            db.commit()

        sample_tickets = []
        # Seed sample tickets if there are no tickets in the database
        if db.query(Ticket).count() == 0:
            print("Seeding sample tickets...")
            sample_tickets = [
            {
                "customer_name": "Sarah Connor",
                "customer_email": "sconnor@cyberdyne.com",
                "subject": "System crash during security override",
                "description": "The security console completely froze when attempting to disable the main core override interface. Requesting technical support.",
                "status": "Open",
                "category": "Technical Issue",
                "notes": ["Triggered a local system scan.", "Attempting override simulation."]
            },
            {
                "customer_name": "Tony Stark",
                "customer_email": "tony@starkindustries.com",
                "subject": "Billing issue with arc reactor order #998",
                "description": "I was billed twice for the recent shipment of palladium core connectors. Please refund the duplicate transaction of $4,500,000.",
                "status": "In Progress",
                "category": "Billing",
                "notes": ["Forwarded request to finance queue.", "Finance reviewing duplicate charge."]
            },
            {
                "customer_name": "Bruce Banner",
                "customer_email": "hulk@avengers.org",
                "subject": "Request for stress tracker integration",
                "description": "Would love a feature that monitors biosensor spikes and alerts the support team before things get out of hand. Critical for my workflow.",
                "status": "Open",
                "category": "Feature Request",
                "notes": []
            },
            {
                "customer_name": "Steve Rogers",
                "customer_email": "cap@shield.gov",
                "subject": "Unable to access portal - account locked out",
                "description": "My shield status dashboard shows 'Access Denied'. Looks like a credentials validation lock out. Please unlock.",
                "status": "Open",
                "category": "Account Issue",
                "notes": ["Verified user credentials.", "Sent reset token."]
            },
            {
                "customer_name": "Peter Parker",
                "customer_email": "spidey@dailybugle.com",
                "subject": "Bug report: Camera feed upload failure",
                "description": "When uploading JPEG photos from the field, the dashboard returns error code 422: 'Invalid image format'. It happens on both mobile and desktop.",
                "status": "In Progress",
                "category": "Bug Report",
                "notes": ["Investigating FastAPI request validation error."]
            },
            {
                "customer_name": "Diana Prince",
                "customer_email": "diana@themyscira.net",
                "subject": "API response latency spikes in Europe-West",
                "description": "We are seeing severe HTTP request timeout errors on our regional gateways. Please review availability status.",
                "status": "Closed",
                "category": "Technical Issue",
                "notes": ["Re-routed traffic to Germany gateway.", "Latency resolved. Customer confirmed OK."]
            },
            {
                "customer_name": "Clark Kent",
                "customer_email": "ckent@dailyplanet.com",
                "subject": "Subscription billing plan upgrade request",
                "description": "I would like to upgrade my newsroom organization profile from Professional to Enterprise tier. Please send a corporate invoice.",
                "status": "Closed",
                "category": "Billing",
                "notes": ["Enterprise tier enabled.", "Invoice sent and resolved."]
            },
            {
                "customer_name": "Wanda Maximoff",
                "customer_email": "wanda@westview.io",
                "subject": "Feature Request: Custom UI Theme Customizer",
                "description": "It would be wonderful to customize sidebar layouts and background cards using an HSL picker. Dark/light modes are not enough.",
                "status": "Open",
                "category": "Feature Request",
                "notes": []
            },
            {
                "customer_name": "Arthur Dent",
                "customer_email": "adent@hitchhiker.org",
                "subject": "Demolition notification dispute",
                "description": "I was never informed that my bypass account was scheduled for deletion. The alert logs say they were on display in a cellar.",
                "status": "In Progress",
                "category": "Account Issue",
                "notes": ["Checked audit log history.", "Restoring deleted profile backup."]
            },
            {
                "customer_name": "Luke Skywalker",
                "customer_email": "luke@rebelalliance.space",
                "subject": "Targeting system alignment drift bug",
                "description": "The thermal exhaust port sensor displays a 2-meter alignment drift when exiting hyperspace. Need a firmware patch.",
                "status": "Closed",
                "category": "Bug Report",
                "notes": ["Calibrated visual tracking metrics.", "Applied navigation patch. Target locked."]
            },
            {
                "customer_name": "Barry Allen",
                "customer_email": "flash@star-labs.com",
                "subject": "Speedometer telemetry synchronization delay",
                "description": "Data packets from high-velocity scans are arriving out of chronological order. Telemetry graph jumps backward.",
                "status": "Open",
                "category": "Technical Issue",
                "notes": []
            },
            {
                "customer_name": "Bruce Wayne",
                "customer_email": "wayne@waynecorp.com",
                "subject": "Invoicing issue for special graphite composite order",
                "description": "The bat-signal replacement orders were charged under double delivery fees. Please check invoice #7756.",
                "status": "Closed",
                "category": "Billing",
                "notes": ["Refunded composite duplicate shipment fee.", "Account manager updated Bruce."]
            },
            {
                "customer_name": "Selina Kyle",
                "customer_email": "cat@gotham.org",
                "subject": "Request: Password manager integration",
                "description": "Can we get secure API links to auto-fill passphrases from bitwarden or 1password? The manual key input gets tedious.",
                "status": "Open",
                "category": "Feature Request",
                "notes": []
            },
            {
                "customer_name": "Logan Howlett",
                "customer_email": "logan@x-mansion.edu",
                "subject": "Biometric tracking profile locked after reset",
                "description": "My profile is locked out and the system does not recognize my fingerprint scans anymore. Reset verification links not arriving.",
                "status": "In Progress",
                "category": "Account Issue",
                "notes": ["Agent manually verified caller identity.", "Overrode profile block. Access restored."]
            },
            {
                "customer_name": "Hal Jordan",
                "customer_email": "greenlantern@oa.org",
                "subject": "UI Bug: Ring recharge widget flicker",
                "description": "The battery progress widget flickers between green and black when charging status is active. Display bug only.",
                "status": "Open",
                "category": "Bug Report",
                "notes": ["Confirmed widget redraw bug."]
            },
            {
                "customer_name": "Arthur Curry",
                "customer_email": "aquaman@atlantis.gov",
                "subject": "Deep-sea sensor telemetry connection drop",
                "description": "Underwater telemetry nodes are dropping connections. We see 99% packet drop below 100 meters. Diagnostics report requested.",
                "status": "Closed",
                "category": "Technical Issue",
                "notes": ["Confirmed acoustic frequency interference.", "Shifted signal to long-wave. Telemetry stable."]
            },
            {
                "customer_name": "Walter White",
                "customer_email": "heisenberg@albuquerque.net",
                "subject": "Billing issue: Chemical supplies pricing mismatch",
                "description": "The bulk pricing discount for laboratory glassware was not calculated in our monthly invoice. Please apply the discount.",
                "status": "In Progress",
                "category": "Billing",
                "notes": ["Checking pricing terms contract."]
            },
            {
                "customer_name": "Sherlock Holmes",
                "customer_email": "sherlock@221b.co.uk",
                "subject": "Request for timeline search filters",
                "description": "It is of highest importance to filter activity notes by timestamp range to quickly isolate critical clues. Feature request.",
                "status": "Open",
                "category": "Feature Request",
                "notes": []
            },
            {
                "customer_name": "Neo",
                "customer_email": "neo@zion.net",
                "subject": "Unable to change matrix escape key password",
                "description": "My access logs throw validation error when executing passphrase updates. Account is stuck in temporary mode.",
                "status": "Closed",
                "category": "Account Issue",
                "notes": ["Unlocked matrix node access.", "Neo verified security key is active."]
            },
            {
                "customer_name": "Indiana Jones",
                "customer_email": "indy@marshall.edu",
                "subject": "Broken links in archaeological registry maps",
                "description": "Map coordinates under map index #443 lead to 404 errors. Looks like a database indexing mapping bug.",
                "status": "Closed",
                "category": "Bug Report",
                "notes": ["Restored map assets links.", "Map index verified."]
            }
        ]

        if sample_tickets:
            now = datetime.now(timezone.utc)
            for index, item in enumerate(sample_tickets):
                created_at = now - timedelta(days=20 - index, hours=index)
                ticket = Ticket(
                    customer_name=item["customer_name"],
                    customer_email=item["customer_email"],
                    subject=item["subject"],
                    description=item["description"],
                    status=item["status"],
                    category=item["category"],
                    created_at=created_at,
                    updated_at=created_at
                )
                db.add(ticket)
                db.flush()
                ticket.ticket_id = f"TKT-{ticket.id:03d}"
                
                for note_text in item["notes"]:
                    note = Note(
                        ticket_id=ticket.ticket_id,
                        note_text=note_text,
                        created_at=created_at + timedelta(minutes=30)
                    )
                    db.add(note)
            
            db.commit()
            print("Database successfully seeded with users and tickets!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
