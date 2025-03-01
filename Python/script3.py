import sys
import json
import pickle
import numpy as np
from scipy.spatial import KDTree


def update_kd_tree(existing_features, existing_photo_ids, new_features):
    if existing_features.ndim == 1:
        existing_features = existing_features.reshape(1, -1)

    combined_features = existing_features.tolist()
    photo_ids = existing_photo_ids.copy()

    required_keys = {"ColorHistogram", "TextureFeatures", "ShapeDescriptors", "PhotoID"}

    for features in new_features:
        if not required_keys.issubset(features):
            raise ValueError(f"Missing required keys in input: {features}")

        combined = (
                features["ColorHistogram"] +
                features["TextureFeatures"] +
                features["ShapeDescriptors"]
        )
        combined_features.append(combined)
        photo_ids.append(features["PhotoID"])

    feature_array = np.array(combined_features)

    # Update KD-Tree
    kd_tree = KDTree(feature_array)

    return kd_tree, photo_ids


def main():
    try:
        # Load existing features from files
        with open('kd_tree.pkl', 'rb') as f:
            kd_tree = pickle.load(f)
            existing_feature_array = kd_tree.data

        with open('photo_ids.json', 'r') as f:
            existing_photo_ids = json.load(f)

        # Load new features from input
        input_data = sys.stdin.read().strip()
        new_features = json.loads(input_data)

        # Update KD-Tree
        kd_tree, photo_ids = update_kd_tree(existing_feature_array, existing_photo_ids, new_features)

        # Save updated KD-Tree using pickle
        with open('kd_tree.pkl', 'wb') as f:
            pickle.dump(kd_tree, f)

        # Save updated photo IDs
        with open('photo_ids.json', 'w') as f:
            json.dump(photo_ids, f)

        print("KD-Tree updated and saved successfully.")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
