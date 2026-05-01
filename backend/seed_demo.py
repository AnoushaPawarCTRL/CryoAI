from backend.main import app
from models import db, Iceberg

with app.app_context():
    if Iceberg.query.count() == 0:
        demo = Iceberg(
            name="A23A Demo Iceberg",
            latitude=-73.5,
            longitude=-40.0,
            image_path="uploads/A23A_001.png",
            mask_path="masks/A23A_001_mask.png",
            area=145,
            status="complete"
        )
        db.session.add(demo)
        db.session.commit()
        print("✅ Demo iceberg inserted")
    else:
        print("ℹ️ Icebergs already exist")
