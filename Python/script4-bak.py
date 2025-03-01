import sys
import json
import pickle
import numpy as np


def load_vp_tree(vp_tree_path, photo_ids_path):
    """
    Load VP-Tree and photo IDs from files.
    """
    with open(vp_tree_path, 'rb') as f:
        vp_tree = pickle.load(f)

    with open(photo_ids_path, 'r') as f:
        photo_ids = json.load(f)

    return vp_tree, photo_ids


def search_vp_tree(vp_tree, photo_ids, query_features, query_photo_id, n):
    """
    Search the VP-Tree for the n nearest neighbors, excluding the query photo ID.
    """
    neighbors = vp_tree.get_n_nearest_neighbors(query_features, n + 1)

    # Debugging: Print the neighbors
    print("Neighbors:", neighbors)

    if not neighbors:
        print("Error: No neighbors found!")
        return []

    nearest_photo_ids = [
        photo_ids[int(i[1])]
        for i in neighbors
        if isinstance(i[1], int) and 0 <= int(i[1]) < len(photo_ids) and photo_ids[int(i[1])] != query_photo_id
    ]
    
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

    # Load VP-Tree and photo IDs
    vp_tree_path = 'vp_tree.pkl'
    photo_ids_path = 'photo_ids.json'
    vp_tree, photo_ids = load_vp_tree(vp_tree_path, photo_ids_path)

    # Search VP-Tree for nearest neighbors
    nearest_photo_ids = search_vp_tree(vp_tree, photo_ids, query_features, query_photo_id, n)

    # Print nearest photo IDs
    print(json.dumps(nearest_photo_ids))


if __name__ == "__main__":
    main()
