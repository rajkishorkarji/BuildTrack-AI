import sys
import json

def predict_cost_overrun(budget, spent_amount, progress_pct):
    """
    BuildTrack AI - Cost Overrun Forecast Model
    Projects final cost based on burn rate and progress completion.
    """
    if progress_pct <= 0:
        return {"status": "error", "message": "Progress percentage must be greater than 0"}

    cost_per_pct = spent_amount / progress_pct
    projected_final_cost = cost_per_pct * 100.0
    projected_overrun = projected_final_cost - budget
    overrun_pct = round((projected_overrun / budget) * 100.0, 2) if budget > 0 else 0.0

    if overrun_pct > 15:
        level = "HIGH"
        recommendation = f"Severe cost overrun projected ({overrun_pct}% above budget). Audit sub-contractor material billings immediately."
    elif overrun_pct > 5:
        level = "MEDIUM"
        recommendation = f"Minor budget variance detected ({overrun_pct}% over budget). Re-negotiate bulk equipment rental rates."
    else:
        level = "LOW"
        recommendation = "Project expenses are operating efficiently within allocated financial cap."

    return {
        "status": "success",
        "budget": budget,
        "spent_amount": spent_amount,
        "progress_pct": progress_pct,
        "projected_final_cost": round(projected_final_cost, 2),
        "projected_overrun_amount": round(max(0.0, projected_overrun), 2),
        "overrun_percentage": max(0.0, overrun_pct),
        "risk_level": level,
        "recommendation": recommendation
    }

if __name__ == "__main__":
    b = float(sys.argv[1]) if len(sys.argv) > 1 else 162600.0
    s = float(sys.argv[2]) if len(sys.argv) > 2 else 132600.0
    p = float(sys.argv[3]) if len(sys.argv) > 3 else 66.0
    
    result = predict_cost_overrun(b, s, p)
    print(json.dumps(result, indent=2))
