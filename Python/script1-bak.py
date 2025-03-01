import sys
import json
import numpy as np
from skimage import io, color
from skimage.feature import hog
import cv2


def generate_features(image_path):
    # Load the image
    image = io.imread(image_path)
    gray_image = color.rgb2gray(image) if len(image.shape) == 3 else image

    # Extract HOG features (Texture)
    hog_features, _ = hog(gray_image, pixels_per_cell=(8, 8), cells_per_block=(2, 2), visualize=True)

    # Extract color histogram
    color_histogram = np.histogram(image.ravel(), bins=256, range=(0, 255))[0]

    # Extract Hu Moments (Shape Descriptors)
    moments = cv2.moments((gray_image * 255).astype(np.uint8))
    hu_moments = cv2.HuMoments(moments).flatten()

    # Log-transform Hu Moments safely
    hu_moments = np.where(hu_moments > 0, -np.log10(hu_moments), 0)

    # Combine all features
    features = {
        "ColorHistogram": color_histogram.tolist(),
        "TextureFeatures": hog_features.tolist(),
        "ShapeDescriptors": hu_moments.tolist()
    }

    return features


def main():
    #input_data = '{"ImagePath": "lnqzht4f.m3g.jpg"}'
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    if 'ImagePath' in data:
        image_path = data['ImagePath']
        features = generate_features(image_path)

        # Print the extracted features for storage in the database
        print(json.dumps(features))


if __name__ == "__main__":
    main()
