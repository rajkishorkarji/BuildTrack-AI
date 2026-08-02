import sys
import json

def predict_delay(progress_pct, worker_count, target_days_left, rain_probability=0.2):
    """
    BuildTrack AI - Delay Risk Prediction Model
    Calculates estimated delay risk percentage and probable delay in days.
    """
    expected_daily_progress = (100 - progress_pct) / max(target_days_left, 1)
    worker_capacity = worker_count * 1.5
    
    # Risk calculation heuristic
    deficit_factor = max(0.0, 5.0 - (worker_capacity / max(expected_daily_progress, 0.1)))
    weather_impact = rain_probability * 15.0
    
    raw_risk = (deficit_factor * 12.0) + weather_impact + max(0.0, (50 - progress_pct) * 0.4)
    risk_score = round(min(99.9, max(5.0, raw_risk)), 2)
    
    if risk_score > 70:
        level = "HIGH"
        est_days = round((risk_score / 100.0) * target_days_left * 0.4, 1)
        recommendation = f"High delay risk detected ({risk_score}%). Allocate {int(worker_count * 0.3)} additional skilled workers and optimize shift schedules."
    elif risk_score > 35:
        level = "MEDIUM"
        est_days = round((risk_score / 100.0) * target_days_left * 0.2, 1)
        recommendation = f"Moderate schedule variance ({risk_score}%). Monitor daily milestones and concrete curing rates."
    else:
        level = "LOW"
        est_days = 0.0
        recommendation = "Project timeline is on track within nominal tolerance."

    return {
        "status": "success",
        "risk_score": risk_score,
        "risk_level": level,
        "estimated_delay_days": est_days,
        "recommendation": recommendation
    }

if __name__ == "__main__":
    # Test execution
    progress = float(sys.argv[1]) if len(sys.argv) > 1 else 66.0
    workers = int(sys.argv[2]) if len(sys.argv) > 2 else 24
    days_left = int(sys.argv[3]) if len(sys.argv) > 3 else 45
    
    result = predict_delay(progress, workers, days_left)
    print(json.dumps(result, indent=2))
