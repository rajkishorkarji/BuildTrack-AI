import sys
import json

def match_workers(task_skill_required, worker_candidates):
    """
    BuildTrack AI - Worker Skill & Productivity Matcher
    Ranks workers for high-priority task allocation.
    """
    scored = []
    for w in worker_candidates:
        score = 50.0
        if w.get("skill_trade", "").lower() == task_skill_required.lower():
            score += 40.0
        if w.get("status") == "ACTIVE":
            score += 10.0
        scored.append({
            "worker_id": w.get("id"),
            "full_name": w.get("full_name"),
            "skill_trade": w.get("skill_trade"),
            "match_score": min(100.0, score),
            "suitability": "EXCELLENT" if score >= 80 else ("GOOD" if score >= 60 else "MODERATE")
        })
    
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "status": "success",
        "task_skill_required": task_skill_required,
        "recommendations": scored
    }

if __name__ == "__main__":
    sample_workers = [
        {"id": 1, "full_name": "Rose Smith", "skill_trade": "Mason", "status": "ACTIVE"},
        {"id": 2, "full_name": "Robert Fox", "skill_trade": "Structural Welder", "status": "ACTIVE"},
        {"id": 3, "full_name": "Theresa Webb", "skill_trade": "Electrician", "status": "ACTIVE"}
    ]
    skill = sys.argv[1] if len(sys.argv) > 1 else "Mason"
    res = match_workers(skill, sample_workers)
    print(json.dumps(res, indent=2))
