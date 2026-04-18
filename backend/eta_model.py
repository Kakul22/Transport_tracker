import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Mock historical data banate hain
# Features: [distance_to_stop, hour_of_day, speed, network_quality]
# network_quality: good=1, medium=2, poor=3

np.random.seed(42)
n = 500

distance = np.random.uniform(0.1, 2.0, n)
hour = np.random.randint(7, 22, n)
speed = np.random.uniform(10, 50, n)
network = np.random.choice([1, 2, 3], n)

# ETA formula — distance/speed + network delay + rush hour delay
eta = (distance / speed) * 60  # minutes
eta += (network - 1) * 2       # network delay
eta += np.where((hour >= 8) & (hour <= 10), 3, 0)   # morning rush
eta += np.where((hour >= 17) & (hour <= 19), 3, 0)  # evening rush
eta += np.random.normal(0, 0.5, n)  # noise

X = np.column_stack([distance, hour, speed, network])
y = eta

# Model train karo
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

def predict_eta(distance_km, hour_of_day, speed_kmh, network_quality):
    """
    distance_km: kitna door hai stop
    hour_of_day: abhi ka time (0-23)
    speed_kmh: bus ki speed
    network_quality: good=1, medium=2, poor=3
    """
    features = np.array([[distance_km, hour_of_day, speed_kmh, network_quality]])
    eta_minutes = model.predict(features)[0]
    return round(max(0.5, eta_minutes), 1)

