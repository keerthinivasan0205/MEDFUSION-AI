# AI Multi-Disease Prediction System - Backend (Refactored)

## Production-Ready Architecture

### Key Improvements:
- Application Factory Pattern with `create_app()`
- Centralized extensions initialization (`extensions.py`)
- Separated ML predictors from database models
- Multiple configuration classes (Development, Production, Testing)
- Error handling middleware
- Scalable modular architecture

## Folder Structure

```
backend/
│
├── app.py                          # Entry point - runs create_app()
├── config.py                       # Config classes (Dev, Prod, Test)
├── requirements.txt                # Dependencies
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore
├── README.md                       # Documentation
│
├── app/
│   ├── __init__.py                # Application factory - create_app()
│   ├── extensions.py              # Flask extensions (db, jwt, cors)
│   │
│   ├── database/                  # Database layer
│   │   ├── __init__.py
│   │   ├── db.py                 # Database connection
│   │   └── models.py             # SQLAlchemy ORM models (User, Prediction)
│   │
│   ├── predictors/                # ML prediction logic (renamed from models)
│   │   ├── __init__.py
│   │   ├── base_predictor.py    # Base predictor class
│   │   ├── skin_predictor.py    # Skin disease predictor
│   │   ├── xray_predictor.py    # X-ray predictor
│   │   └── mri_predictor.py     # MRI predictor
│   │
│   ├── routes/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py               # Authentication (register/login)
│   │   ├── prediction.py         # Prediction endpoints
│   │   └── report.py             # Report generation
│   │
│   ├── middleware/                # Request/Response middleware
│   │   ├── __init__.py
│   │   └── error_handler.py      # Global error handling
│   │
│   ├── utils/                     # Helper utilities
│   │   ├── __init__.py
│   │   ├── image_processor.py    # Image preprocessing
│   │   ├── pdf_generator.py      # PDF generation
│   │   ├── validators.py         # Input validation
│   │   └── file_handler.py       # File management
│   │
│   └── ml_models/                 # Trained .h5 models
│       ├── skin/
│       ├── xray/
│       └── mri/
│
├── uploads/                       # Temporary uploads
│   └── temp/
│
├── reports/                       # Generated PDFs
│
└── logs/                          # Application logs
```

## Setup

1. Create virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Set `FLASK_ENV=development` or `FLASK_ENV=production`
   - Update database credentials and JWT secret

4. Place trained models in `app/ml_models/`

5. Run:
   ```
   python app.py
   ```

## Architecture Benefits

✅ **Separation of Concerns**: Database models vs ML predictors
✅ **Application Factory**: Easy testing and multiple instances
✅ **Centralized Extensions**: Single source for db, jwt, cors
✅ **Environment-based Config**: Dev, Prod, Test configurations
✅ **Scalable**: Easy to add new ML models
✅ **Production-Ready**: Error handling, logging, middleware
