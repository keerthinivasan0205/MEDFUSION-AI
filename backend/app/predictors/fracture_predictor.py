import tensorflow as tf
import numpy as np
import cv2
import os

class FracturePredictor:

    def __init__(self):
        model_path = "app/ml_models/fracture/bone_model.keras"
        self.use_stub = False
        if not os.path.exists(model_path):
            print(f"Warning: fracture model missing at {model_path}. Using stub.")
            self.use_stub = True
        else:
            self.model = tf.keras.models.load_model(model_path)

        self.img_size = 224
        self.classes = ["normal", "abnormal"]

    def preprocess(self, image_path):

        img = cv2.imread(image_path)
        img = cv2.resize(img, (self.img_size, self.img_size))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)

        return img

    def predict(self, image_path):
        if self.use_stub:
            return "abnormal", 0.87

        img = self.preprocess(image_path)

        prediction = self.model.predict(img)[0][0]

        confidence = float(prediction)

        if prediction > 0.5:
            predicted_class = "abnormal"
        else:
            predicted_class = "normal"

        return predicted_class, confidence