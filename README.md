# CryoAI

**AI iceberg segmentation from satellite imagery.**

Tracking icebergs by hand means hours of manually outlining shapes on satellite images every week. CryoAI uses deep learning to segment icebergs automatically and calculates their real world area from the image's geographic metadata, turning hours of work into seconds.

Built as my final year project for a BSc in Computer Science at Brunel University London.

<!-- TODO: add a screenshot or GIF of the app here -->

## How it works

1. **Data pipeline:** Copernicus satellite imagery is matched with US National Ice Center iceberg coordinates, then labelled in QGIS to create a training dataset from scratch.
2. **Preprocessing:** speckle reduction and edge enhancement make icebergs stand out from the surrounding sea ice.
3. **Segmentation:** a trained model produces a binary mask of the iceberg.
4. **Area calculation:** the backend reads the GeoTIFF affine transform to get the real size of each pixel in metres, counts the iceberg pixels and converts the result to square nautical miles.
5. **Platform:** results are stored in PostgreSQL and shown in a React app with an interactive 3D globe.

## Models

I trained and compared four approaches:

| Model | Type | IoU | Dice |
|---|---|---|---|
| U-Net | Semantic segmentation (CNN) | TODO | TODO |
| SAM | Transformer, fine tuned | TODO | TODO |
| Detectron2 | Instance segmentation | TODO | TODO |
| ResNet50 | CNN backbone | TODO | TODO |

**Key finding:** limited training data was the main factor holding back performance across every model. To address this, I fine tuned SAM for assisted labelling, making it faster to produce new training masks and scale up the dataset.

Evaluation included K fold cross validation and bootstrapping (both suited to small datasets), plus inference time and memory usage tests. See [`notebooks/`](notebooks/).

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, react-globe.gl, Axios |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT |
| ML | TensorFlow, SAM, Detectron2, Google Colab |
| Geospatial | rasterio, QGIS |

## Running locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your own values:

```
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/icebergtracker
SECRET_KEY=<random string>
```

Start the API:

```bash
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm start
```

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload-image` | Upload a GeoTIFF satellite image |
| POST | `/upload-mask` | Upload a segmentation mask; calculates area |
| GET | `/icebergs` | List all icebergs with area and status |
| POST | `/update-areas` | Recalculate area for every stored mask |
| POST | `/seed-demo` | Load the demo iceberg (A23A) |

## Roadmap

- [ ] Inference endpoint so the API runs the model directly on uploaded images
- [ ] Upload page with the predicted mask overlaid on the image
- [ ] Image tiling to expand the training dataset
- [ ] Read iceberg coordinates from GeoTIFF metadata
- [ ] Docker setup and live deployment

## Author

**Anousha Kaur Pawar** · [GitHub](https://github.com/AnoushaPawarCTRL)