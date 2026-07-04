"""
Seed script – creates initial admin user and sample data.
Run: python seed.py
"""
from app.database.session import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.settings import CompanySettings
from app.core.security import get_password_hash

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Admin user
if not db.query(User).filter(User.email == "admin@example.com").first():
    admin = User(
        name="Administrator",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.admin,
        is_active=True,
    )
    db.add(admin)
    print("✓ Admin user created: admin@example.com / admin123")

# Default settings
if not db.query(CompanySettings).first():
    s = CompanySettings(
        company_name="My Billing Company",
        invoice_prefix="INV",
        purchase_prefix="PUR",
        currency="INR",
        currency_symbol="₹",
    )
    db.add(s)
    print("✓ Default company settings created")

db.commit()
db.close()
print("Seeding complete.")
