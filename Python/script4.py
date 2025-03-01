import sys
import json
import pickle
from scipy.spatial import KDTree


def load_kd_tree(kd_tree_path, photo_ids_path):
    """ Loads the KD-Tree and photo IDs from files. """
    with open(kd_tree_path, 'rb') as f:
        kd_tree = pickle.load(f)
    with open(photo_ids_path, 'r') as f:
        photo_ids = json.load(f)
    return kd_tree, photo_ids


def search_kd_tree(kd_tree, photo_ids, query_features, query_photo_id, n):
    """ Searches the KD-Tree for the nearest neighbors of the query features. """
    # Find the nearest neighbors
    distances, indices = kd_tree.query(query_features, k=n + 1)

    # Extract the photo IDs of the nearest neighbors
    nearest_photo_ids = [photo_ids[idx] for idx in indices if photo_ids[idx] != query_photo_id]

    # Return only the top 'n' neighbors excluding the query photo
    return nearest_photo_ids[:n]


def main():
    # Read input data
    input_data = sys.stdin.read().strip()
    data = json.loads(input_data)

    # Extract query features
    query_features = (
            data["ColorHistogram"] +
            data["TextureFeatures"] +
            data["ShapeDescriptors"]
    )

    # Extract query photo ID
    query_photo_id = data["PhotoID"]

    # Number of neighbors
    n = data.get("n", 5)

    # Load KD-Tree and photo IDs
    kd_tree_path = 'kd_tree.pkl'
    photo_ids_path = 'photo_ids.json'
    kd_tree, photo_ids = load_kd_tree(kd_tree_path, photo_ids_path)

    # Search KD-Tree for nearest neighbors
    nearest_photo_ids = search_kd_tree(kd_tree, photo_ids, query_features, query_photo_id, n)

    # Print nearest photo IDs
    print(json.dumps(nearest_photo_ids))


if __name__ == "__main__":
    main()
