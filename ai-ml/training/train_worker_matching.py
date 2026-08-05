import os
import json
import random

def train_worker_matching_model():
    """
    BuildTrack AI - Synthetic Worker Matcher Trainer
    Generates synthetic training dataset and calculates skill trade affinity weights.
    """
    trades = ["Mason", "Electrician", "Carpenter", "Structural Welder", "Plumber", "Crane Operator"]
    dataset = []

    for _ in range(500):
        t_req = random.choice(trades)
        t_worker = random.choice(trades)
        active = random.choice([True, False])
        years_exp = random.randint(1, 15)
        
        match_score = 50.0
        if t_req == t_worker:
            match_score += 35.0
        if active:
            match_score += 10.0
        match_score += min(15.0, years_exp * 1.0)
        
        dataset.append({
            "task_trade": t_req,
            "worker_trade": t_worker,
            "is_active": active,
            "experience_years": years_exp,
            "suitability_score": round(match_score, 1)
        })

    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "worker_matching_meta.json")

    model_data = {
        "model_type": "Heuristic Skill Affinity Matrix v1.0",
        "dataset_size": len(dataset),
        "trained_trades": trades,
        "sample_rule": "Base 50.0 + Trade Match 35.0 + Active Status 10.0 + Exp Bonus (max 15.0)"
    }

    with open(model_path, "w") as f:
        json.dump(model_data, f, indent=2)

    print(f"Worker matching training metadata saved to: {model_path}")
    return model_data

if __name__ == "__main__":
    train_worker_matching_model()
