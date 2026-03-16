import numpy as np
from PIL import Image
from tensorflow.keras.applications.resnet50 import preprocess_input


def process_image(image_path):

    image = Image.open(image_path).convert("RGB")
    image = image.resize((224, 224))

    image_array = np.array(image)
    image_array = np.expand_dims(image_array, axis=0)

    image_array = preprocess_input(image_array)

    return image_array