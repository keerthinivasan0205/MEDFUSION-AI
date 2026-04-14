import os
import numpy as np
from tensorflow import keras
from app.utils.image_processor import process_image


class SkinPredictor:

    def __init__(self):
        BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

        self.model_path = os.path.join(BASE_DIR, "ml_models", "skin", "skin_model_4class_final.keras")

        print("Loading Skin Model from:", self.model_path)

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}")

        self.model = keras.models.load_model(self.model_path, compile=False)

        print("Skin model loaded successfully!")

        self.class_names = ["benign_other", "malignant_other", "melanoma", "nevus"]

    def predict(self, image_path):
        image_array = process_image(image_path)

        predictions = self.model.predict(image_array)[0]

        predicted_index = np.argmax(predictions)
        confidence = float(predictions[predicted_index])
        predicted_class = self.class_names[predicted_index]

        all_probabilities = {
            self.class_names[i]: round(float(predictions[i] * 100), 2)
            for i in range(len(self.class_names))
        }

        return predicted_class, confidence, all_probabilities
