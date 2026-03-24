import numpy as np
import cv2


def segment_lungs(seg_model, image_path):

    img = cv2.imread(image_path)

    if img is None:
        raise ValueError("Image not found")

    original_h, original_w = img.shape[:2]

    # convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # resize for segmentation model
    resized = cv2.resize(gray, (256, 256))

    resized = resized.astype("float32") / 255.0
    resized = np.expand_dims(resized, axis=-1)
    resized = np.expand_dims(resized, axis=0)

    # predict mask
    mask = seg_model.predict(resized, verbose=0)[0]

    # convert probability mask to binary
    mask = (mask > 0.5).astype("uint8")
    mask = np.squeeze(mask)

    # resize mask back using NEAREST (important!)
    mask = cv2.resize(mask, (original_w, original_h), interpolation=cv2.INTER_NEAREST)

    # clean mask
    kernel = np.ones((7,7), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # apply mask
    segmented = cv2.bitwise_and(img, img, mask=mask)

    segmented_path = image_path.replace(".jpeg", "_segmented.jpeg")

    cv2.imwrite(segmented_path, segmented)

    return segmented_path