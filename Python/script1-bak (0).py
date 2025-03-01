import sys
import json
import numpy as np
from skimage import io, color
from skimage.feature import hog, local_binary_pattern
import cv2


def generate_features(image_path, hog_length=4096, color_bins=256):
    # Load the image
    image = io.imread(image_path)
    gray_image = color.rgb2gray(image) if len(image.shape) == 3 else image

    # Extract HOG features (Texture) and ensure fixed length
    hog_features, _ = hog(gray_image, pixels_per_cell=(8, 8), cells_per_block=(2, 2), visualize=True)
    hog_features = np.pad(hog_features, (0, max(0, hog_length - len(hog_features))), 'constant')
    hog_features = hog_features[:hog_length]  # Ensure fixed length

    # Extract color histogram (Fixed length: 256 bins)
    color_histogram = np.histogram(image.ravel(), bins=color_bins, range=(0, 255))[0]

    # Extract Hu Moments (Shape Descriptors, Fixed length: 7)
    moments = cv2.moments((gray_image * 255).astype(np.uint8))
    hu_moments = cv2.HuMoments(moments).flatten()
    hu_moments = np.log10(np.clip(hu_moments, 1e-10, None)) * -1  # Avoid log(0)

    # Preserve Original Output Format (Field Names Stay the Same!)
    features = {
        "ColorHistogram": color_histogram.tolist(),
        "TextureFeatures": hog_features.tolist(),
        "ShapeDescriptors": hu_moments.tolist()
    }

    return features


def main():
    input_data = '{"ImagePath": "6c004821-aca3-4bf5-8e1d-d9ef887a99d7.png"}'
    #input_data = sys.stdin.read()
    data = json.loads(input_data)

    if 'ImagePath' in data:
        image_path = data['ImagePath']
        features = generate_features(image_path)

        # Print the extracted features for storage in the database
        print(json.dumps(features))


if __name__ == "__main__":
    main()
