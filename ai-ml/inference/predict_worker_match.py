import sys
import json

def match_workers(task_skill_required, worker_candidates):
    scored = []
    required = (task_skill_required or "").strip().lower()

    for w in worker_candidates:
        skill = str(w.get("skill_trade") or "")
        score = 50.0
        if required and skill.lower() == required:
            score += 40.0
        if str(w.get("status") or "").upper() == "ACTIVE":
            score += 10.0

        score = min(100.0, score)
        scored.append({
            "worker_id": w.get("id"),
            "user_id": w.get("user_id"),
            "full_name": w.get("full_name"),
            "skill_trade": skill,
            "status": w.get("status"),
            "match_score": score,
            "suitability": "EXCELLENT" if score >= 80 else ("GOOD" if score >= 60 else "MODERATE")
        })

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "status": "success",
        "task_skill_required": task_skill_required,
        "recommendations": scored
    }

if __name__ == "__main__":
    skill = sys.argv[1] if len(sys.argv) > 1 else "Mason"
    workers_file = sys.argv[2] if len(sys.argv) > 2 else None

    if workers_file:
        with open(workers_file, "r", encoding="utf-8") as f:
            workers = json.load(f)
    else:
        workers = [
            {"id": 1, "full_name": "Sample Worker", "skill_trade": "Mason", "status": "ACTIVE"}
        ]

    print(json.dumps(match_workers(skill, workers)))
