import sys
import json
import numpy as np
import pickle

def main():
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    target_features = np.array(data['TargetFeatures']).reshape(1, -1)
    n_neighbors = data['NumberOfNeighbors']

    # Load the KD-Tree from the file
    with open('kdtree.pkl', 'rb') as f:
        kdtree = pickle.load(f)

    # Perform KNN search
    distances, indices = kdtree.query(target_features, k=n_neighbors)

    # Get the closest photos' PhotoIDs
    photo_ids = data['PhotoIDs']
    similar_photo_ids = [photo_ids[i] for i in indices[0]]

    # Output the result
    print(json.dumps(similar_photo_ids))

if __name__ == "__main__":
    main()