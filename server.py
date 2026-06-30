from flask import Flask, render_template, jsonify, request, send_from_directory
from ml_model import UrbanHeatModel, CITIES_DATA
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    static_folder=BASE_DIR,
    static_url_path="",
    template_folder=BASE_DIR,
)

print("[server] Loading ML models...")
model = UrbanHeatModel()
print("[server] Models loaded successfully!")


@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    try:
        result = model.predict(
            ndvi=float(data.get("ndvi", 0.20)),
            ndbi=float(data.get("ndbi", 0.70)),
            albedo=float(data.get("albedo", 0.25)),
            wind_speed=float(data.get("wind_speed", 3.0)),
            pop_density=float(data.get("pop_density", 15000)),
            building_height=float(data.get("building_height", 25)),
        )
        return jsonify({"status": "ok", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/predict-zone", methods=["POST"])
def predict_zone():
    data = request.get_json(silent=True) or {}
    city_name = data.get("city", "hyderabad").lower()
    zone_name = data.get("zone", "Hitec City")
    
    zones_list = CITIES_DATA.get(city_name, CITIES_DATA["hyderabad"])
    zone = next(
        (z for z in zones_list if z["name"].lower() == zone_name.lower()),
        zones_list[0],
    )
    result = model.predict_zone(zone)
    result["zone"] = zone["name"]
    result["type"] = zone["type"]
    result["population"] = zone["pop"]
    return jsonify({"status": "ok", "data": result})


@app.route("/api/zones")
def get_zones():
    city_name = request.args.get("city", "hyderabad").lower()
    results = model.analyze_all_zones(city=city_name)
    return jsonify({"status": "ok", "data": results, "count": len(results)})


@app.route("/api/feature-importance")
def feature_importance():
    importance = model.get_feature_importance()
    return jsonify({"status": "ok", "data": importance})


@app.route("/api/optimize", methods=["POST"])
def optimize():
    data = request.get_json(silent=True) or {}
    city_name = data.get("city", "hyderabad").lower()
    zone_name = data.get("zone")
    budget = float(data.get("budget", 10.0))
    result = model.optimize_cooling(zone_name=zone_name, budget_crores=budget, city=city_name)
    return jsonify({"status": "ok", "data": result})


@app.route("/api/model-metrics")
def model_metrics():
    metrics = model.get_model_metrics()
    return jsonify({"status": "ok", "data": metrics})


@app.route("/api/heatwave-risk", methods=["POST"])
def heatwave_risk():
    data = request.get_json(silent=True) or {}
    city_name = data.get("city", "hyderabad").lower()
    zone_name = data.get("zone")

    zones = CITIES_DATA.get(city_name, CITIES_DATA["hyderabad"])
    zone = next((z for z in zones if z["name"].lower() == zone_name.lower()), zones[0])

    # Dynamic ML simulation
    result = model.predict_zone(zone)
    mitigated_temp = result["predicted_temp"] - 2.85
    mitigated_score = max(5, int(result["risk_score"] - 45))
    mitigated_risk = "Low" if mitigated_temp < 37.0 else "Medium" if mitigated_temp < 41.0 else "High"
    
    return jsonify({
        "status": "ok",
        "data": {
            "city": city_name,
            "zone": zone["name"],
            "base_temp": zone["temp"],
            "predicted_temp": result["predicted_temp"],
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "mitigated_temp": float(np.round(mitigated_temp, 2)),
            "mitigated_score": mitigated_score,
            "mitigated_risk": mitigated_risk,
            "recommended_strategy": "Deploy Green Roofs & Albedo-25% paint" if result["risk_score"] > 70 else "Increase tree canopy cover (+15%)"
        }
    })


if __name__ == "__main__":
    import numpy as np
    app.run(host="0.0.0.0", port=5000, debug=True)
