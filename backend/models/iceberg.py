from sqlalchemy import Column, Integer, String, Float
from database import Base

class Iceberg(Base):
    __tablename__ = "icebergs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    image_path = Column(String)
    mask_path = Column(String)
    area = Column(Float)  # sq NM
    status = Column(String)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "image_path": self.image_path,
            "mask_path": self.mask_path,
            "area": self.area,
            "status": self.status
        }