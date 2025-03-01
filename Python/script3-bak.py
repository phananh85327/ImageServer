import sys
import json
from sklearn.neighbors import NearestNeighbors
import numpy as np

def main():
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    target_features = np.array(data['TargetFeatures']).reshape(1, -1)
    all_features = np.array(data['AllFeatures'])
    photo_ids = data['PhotoIDs']
    n_neighbors = data['NumberOfNeighbors']

    # Perform KNN
    knn = NearestNeighbors(n_neighbors=n_neighbors)
    knn.fit(all_features)
    distances, indices = knn.kneighbors(target_features)

    # Get the closest photos' PhotoIDs
    similar_photo_ids = [photo_ids[i] for i in indices[0]]

    # Output the result
    print(json.dumps(similar_photo_ids))

if __name__ == "__main__":
    main()
