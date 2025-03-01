import sys
import json
import numpy as np
from scipy.spatial import KDTree


def build_kd_tree(feature_list):
    combined_features = []
    photo_ids = []
    for features in feature_list:
        combined = (
            features["ColorHistogram"] +
            features["TextureFeatures"] +
            features["ShapeDescriptors"]
        )
        combined_features.append(combined)
        photo_ids.append(features["PhotoID"])

    feature_array = np.array(combined_features)

    # Build KD-Tree
    kd_tree = KDTree(feature_array)

    return kd_tree, photo_ids


def main():
    # Load features from input
    input_data = sys.stdin.read().strip()
    feature_list = json.loads(input_data)

    # Build KD-Tree
    kd_tree, photo_ids = build_kd_tree(feature_list)

    # Save the KD-Tree to a file
    with open('kd_tree.npy', 'wb') as f:
        np.save(f, kd_tree.data)

    # Save photo IDs to a file
    with open('photo_ids.json', 'w') as f:
        json.dump(photo_ids, f)

    print("KD-Tree built and saved successfully.")


if __name__ == "__main__":
    main()
