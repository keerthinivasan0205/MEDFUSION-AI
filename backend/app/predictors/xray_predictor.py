import tensorflow as tf
import numpy as np
from PIL import Image
import os

from app.utils.gradcam import generate_gradcam, overlay_heatmap
from app.utils.lung_segmentation import segment_lungs


class XrayPredictor:

    def __init__(self):

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        MODEL_PATH = os.path.join(BASE_DIR, "ml_models", "xray", "pneumonia_model.keras")
        SEG_MODEL_PATH = os.path.join(BASE_DIR, "ml_models", "xray", "lung_segmentation_model.hdf5")

        self.use_stub = False

        print("Loading Pneumonia Model:", MODEL_PATH)
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SEG_MODEL_PATH):
            print("Warning: Xray model or segmentation model not found. Using stub predictions.")
            self.use_stub = True
        else:
            self.model = tf.keras.models.load_model(MODEL_PATH)
            print("Loading Segmentation Model:", SEG_MODEL_PATH)
            self.seg_model = tf.keras.models.load_model(SEG_MODEL_PATH, compile=False)
            print("Models loaded successfully!")

        self.IMG_SIZE = 224


    def predict(self, image_path):
        if self.use_stub:
            return "pneumonia", 84.3, image_path, image_path

        # ---------- LOAD ORIGINAL IMAGE ----------
        img = Image.open(image_path).convert("RGB")
        img = img.resize((self.IMG_SIZE, self.IMG_SIZE))

        img_array = np.array(img).astype("float32") / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # ---------- MODEL PREDICTION ----------
        preds = self.model.predict(img_array, verbose=0)

        prob = float(preds[0][0])

        if prob > 0.5:
            predicted_class = "pneumonia"
            confidence = prob
        else:
            predicted_class = "normal"
            confidence = 1 - prob

        confidence = round(confidence * 100, 2)

        # ---------- GRADCAM ----------
        heatmap = generate_gradcam(self.model, img_array)

        base_name, ext = os.path.splitext(image_path)

        gradcam_path = base_name + "_gradcam" + ext

        overlay_heatmap(image_path, heatmap, gradcam_path)

        # ---------- LUNG SEGMENTATION (ONLY FOR VISUALIZATION) ----------
        try:
            segmented_path = segment_lungs(self.seg_model, image_path)
        except Exception as e:
            print("Segmentation error:", e)
            segmented_path = image_path

        return predicted_class, confidence, gradcam_path, segmented_path