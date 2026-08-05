import numpy as np

def normalize_features(features):
    """
    Normalizes a list or numpy array of numeric features to a 0-1 range.
    """
    arr = np.array(features, dtype=float)
    min_val = np.min(arr)
    max_val = np.max(arr)
    if max_val == min_val:
        return np.zeros_like(arr).tolist()
    normalized = (arr - min_val) / (max_val - min_val)
    return normalized.tolist()

def encode_skill_trade(trade_name):
    """
    Encodes worker skill trade strings into numeric categorical IDs.
    """
    trade_map = {
        "mason": 1,
        "electrician": 2,
        "carpenter": 3,
        "welder": 4,
        "plumber": 5,
        "crane operator": 6,
        "heavy equipment driver": 7,
        "scaffolder": 8
    }
    return trade_map.get(trade_name.lower().strip(), 0)
