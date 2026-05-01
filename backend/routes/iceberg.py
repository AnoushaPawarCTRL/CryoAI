from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models.iceberg import Iceberg
import rasterio
import numpy as np
from PIL import Image
import requests
import os

router = APIRouter(tags=["icebergs"])

UPLOAD_FOLDER = "uploads"
MASK_FOLDER = "masks"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MASK_FOLDER, exist_ok=True)

def calculate_area_from_mask(mask_path):
    if not mask_path.lower().endswith(".tif"):
        raise ValueError("Mask must be a TIFF file for area calculation.")
    with rasterio.open(mask_path) as src:
        transform = src.transform
        mask_data = src.read(1)
        pixel_width = abs(transform.a)
        pixel_height = abs(transform.e)
        pixel_area_m2 = pixel_width * pixel_height
        white_pixel_count = np.sum(mask_data > 0)
    area_m2 = white_pixel_count * pixel_area_m2
    return area_m2 / 3_429_904

def tiff_to_png(tiff_path, png_path, normalize=True):
    img = Image.open(tiff_path)
    if normalize:
        arr = np.array(img).astype("float32")
        arr = (arr - arr.min()) / (arr.max() - arr.min()) * 255
        img = Image.fromarray(arr.astype("uint8"))
    img.save(png_path, format="PNG")

@router.post("/seed-demo")
def seed_demo(db: Session = Depends(get_db)):
    tiff_mask = "masks/A23A_001_mask.tif"
    if not os.path.exists(tiff_mask):
        raise HTTPException(status_code=400, detail="Demo mask not found")
    area_sqnm = float(calculate_area_from_mask(tiff_mask))
    iceberg = db.query(Iceberg).filter_by(name="A23A Demo Iceberg").first()
    if iceberg:
        iceberg.area = area_sqnm
        iceberg.status = "complete"
    else:
        iceberg = Iceberg(
            name="A23A Demo Iceberg",
            latitude=-73.5, longitude=-40.0,
            image_path="uploads/A23A_001.png",
            mask_path="masks/A23A_001_mask.png",
            area=area_sqnm, status="complete"
        )
        db.add(iceberg)
    db.commit()
    return {"message": "Demo iceberg updated", "area": area_sqnm}

@router.post("/upload-image")
def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename
    tiff_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(tiff_path, "wb") as f:
        f.write(file.file.read())
    png_path = os.path.join(UPLOAD_FOLDER, filename.replace(".tif", ".png"))
    tiff_to_png(tiff_path, png_path)
    iceberg = Iceberg(
        name=filename, latitude=-73.5, longitude=-40.0,
        image_path=png_path, mask_path="", area=None, status="pending"
    )
    db.add(iceberg)
    db.commit()
    db.refresh(iceberg)
    return iceberg.serialize()

@router.get("/icebergs")
def get_icebergs(db: Session = Depends(get_db)):
    return [i.serialize() for i in db.query(Iceberg).all()]

@router.get("/refresh-icebergs")
def refresh_icebergs(db: Session = Depends(get_db)):
    return [i.serialize() for i in db.query(Iceberg).all()]

@router.post("/update-areas")
def update_areas(db: Session = Depends(get_db)):
    for iceberg in db.query(Iceberg).all():
        if not iceberg.mask_path.lower().endswith(".tif"):
            continue
        iceberg.area = calculate_area_from_mask(iceberg.mask_path)
    db.commit()
    return {"status": "success"}

@router.post("/upload-mask")
def upload_mask(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    filename = file.filename
    mask_tiff_path = os.path.join(MASK_FOLDER, filename)
    with open(mask_tiff_path, "wb") as f:
        f.write(file.file.read())
    if not mask_tiff_path.lower().endswith(".tif"):
        raise HTTPException(status_code=400, detail="Mask must be a TIFF file")
    mask_png_path = mask_tiff_path.replace(".tif", ".png")
    tiff_to_png(mask_tiff_path, mask_png_path)
    area_sqnm = float(calculate_area_from_mask(mask_tiff_path))
    inferred = filename.replace("_mask.tif", "").replace(".tif", "")
    iceberg = db.query(Iceberg).filter_by(name=inferred).first()
    if iceberg:
        iceberg.mask_path = mask_png_path
        iceberg.area = area_sqnm
        iceberg.status = "complete"
    else:
        iceberg = Iceberg(
            name=inferred, latitude=-73.5, longitude=-40.0,
            image_path=os.path.join(UPLOAD_FOLDER, f"{inferred}.png") if os.path.exists(os.path.join(UPLOAD_FOLDER, f"{inferred}.png")) else "",
            mask_path=mask_png_path, area=area_sqnm, status="complete"
        )
        db.add(iceberg)
    db.commit()
    db.refresh(iceberg)
    response = iceberg.serialize()
    response["notification"] = "Mask has been generated and saved!"
    notify_url = os.getenv("FRONTEND_NOTIFY_URL")
    if notify_url:
        try:
            requests.post(notify_url, json=response, timeout=5)
        except Exception:
            pass
    return response

@router.get("/uploads/{filename}")
def serve_uploads(filename: str):
    return FileResponse(os.path.join(UPLOAD_FOLDER, filename))

@router.get("/masks/{filename}")
def serve_masks(filename: str):
    return FileResponse(os.path.join(MASK_FOLDER, filename))