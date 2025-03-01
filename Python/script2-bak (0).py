import sys
import json
import pickle
import numpy as np
from vptree import VPTree
from scipy.spatial.distance import euclidean

BATCH_SIZE = 100  # Adjust based on memory


def validate_features(features):
    """ Ensures all feature vectors exist and have correct lengths. """
    required_keys = ["ColorHistogram", "TextureFeatures", "ShapeDescriptors"]
    if not all(k in features for k in required_keys):
        return False  # Missing keys

    # Ensure consistent lengths (Assuming LBP fix makes TextureFeatures fixed-length)
    lengths = [len(features[k]) for k in required_keys]
    return all(l > 0 for l in lengths) and len(set(lengths)) == 3  # All must have values


def process_batch(batch):
    """
    Processes a batch of feature data and returns combined features and IDs.
    """
    combined_features = []
    photo_ids = []

    for features in batch:
        if not validate_features(features):
            print(f"Warning: Invalid feature data (Skipping): {features.get('PhotoID', 'Unknown')}")
            continue

        combined = (
                features["ColorHistogram"] +
                features["TextureFeatures"] +
                features["ShapeDescriptors"]
        )

        combined_features.append(combined)
        photo_ids.append(features["PhotoID"])

    return combined_features, photo_ids


def read_json_batches(file_path, batch_size):
    """
    Reads a large JSON file in batches (streaming method).
    """
    with open(file_path, 'r') as f:
        try:
            data = json.load(f)  # Load full JSON structure (to check if it's nested)
            if isinstance(data, list) and isinstance(data[0], list):
                data = data[0]  # Flatten nested lists

            batch = []
            for item in data:
                batch.append(item)
                if len(batch) >= batch_size:
                    yield batch
                    batch = []

            if batch:
                yield batch  # Yield remaining data

        except json.JSONDecodeError as e:
            print("JSON Parsing Error:", e)


def build_vp_tree(json_file_path):
    """
    Reads the JSON file in batches, processes features, and builds a VP-Tree.
    """
    combined_features = []
    photo_ids = []

    print("Processing JSON file in batches...")

    for batch_index, batch in enumerate(read_json_batches(json_file_path, BATCH_SIZE), start=1):
        if not batch:
            print(f"Warning: Batch {batch_index} is empty!")
            continue

        batch_features, batch_photo_ids = process_batch(batch)
        if not batch_features:
            print(f"Warning: No valid features in batch {batch_index}!")
            continue

        combined_features.extend(batch_features)
        photo_ids.extend(batch_photo_ids)

        print(f"Processed batch {batch_index} with {len(batch_features)} images.")

    if not combined_features:
        print("Error: No valid features found! Check JSON structure.")
        sys.exit(1)

    print("Building VP-Tree...")
    vp_tree = VPTree(combined_features, euclidean)

    # Save VP-Tree and photo IDs
    with open('vp_tree.pkl', 'wb') as f:
        pickle.dump(vp_tree, f)

    with open('photo_ids.json', 'w') as f:
        json.dump(photo_ids, f)

    print("VP-Tree built and saved successfully.")


def main():
    if len(sys.argv) < 2:
        print("Usage: python script.py <path_to_json>")
        sys.exit(1)

    json_file_path = sys.argv[1]
    build_vp_tree(json_file_path)


if __name__ == "__main__":
    main()
