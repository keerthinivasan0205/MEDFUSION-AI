import tensorflow as tf
import numpy as np
from PIL import Image
import os

class AutoPredictor:

    def __init__(self):

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        model_path = os.path.join(BASE_DIR, "ml_models", "auto", "auto_classifier.keras")

        self.model = tf.keras.models.load_model(model_path)

        self.class_names = ["bone_xray", "chest_xray", "skin"]

        self.IMG_SIZE = 224

    def predict(self, image_path):

        img = Image.open(image_path).convert("RGB")
        img = img.resize((self.IMG_SIZE, self.IMG_SIZE))

        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        preds = self.model.predict(img_array)[0]

        index = np.argmax(preds)
        confidence = float(preds[index])

        return self.class_names[index], confidence