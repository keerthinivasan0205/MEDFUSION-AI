import os
import numpy as np
from tensorflow import keras
from app.utils.image_processor import process_image


class SkinPredictor:

    def __init__(self):
        BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

        self.model_path = os.path.join(
            BASE_DIR,
            "ml_models",
            "skin",
            "skin_model_4class_final.keras"
        )

        print("Loading Skin Model from:", self.model_path)

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}")

        # Load model (Keras 3 compatible)
        self.model = keras.models.load_model(self.model_path, compile=False)

        print("Skin model loaded successfully!")

        # Class labels (must match training order)
        self.class_names = [
            "benign_other",
            "malignant_other",
            "melanoma",
            "nevus"
        ]

    def predict(self, image_path):

        # Preprocess image
        image_array = process_image(image_path)

        # Model prediction
        predictions = self.model.predict(image_array)

        # Since output shape is (1, num_classes)
        predictions = predictions[0]

        # Get predicted index
        predicted_index = np.argmax(predictions)

        # Get confidence of predicted class
        confidence = float(predictions[predicted_index])

        predicted_class = self.class_names[predicted_index]

        # Create dictionary of all class probabilities (percentage)
        all_probabilities = {
            self.class_names[i]: round(float(predictions[i] * 100), 2)
            for i in range(len(self.class_names))
        }

        return predicted_class, confidence, all_probabilities