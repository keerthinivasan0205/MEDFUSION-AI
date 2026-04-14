import os
import numpy as np
import cv2
import tensorflow as tf


class FracturePredictor:

    def __init__(self):
        BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        model_path = os.path.join(BASE_DIR, "ml_models", "fracture", "bone_model.keras")

        print("Loading Fracture Model from:", model_path)
        self.model = tf.keras.models.load_model(model_path)
        print("Fracture model loaded successfully!")

        self.img_size = 224
        self.classes = ["normal", "abnormal"]

    def preprocess(self, image_path):
        img = cv2.imread(image_path)
        img = cv2.resize(img, (self.img_size, self.img_size))
        img = img / 255.0
        return np.expand_dims(img, axis=0)

    def predict(self, image_path):
        img = self.preprocess(image_path)
        prediction = self.model.predict(img)[0][0]
        confidence = float(prediction)
        predicted_class = "abnormal" if prediction > 0.5 else "normal"
        return predicted_class, confidence
