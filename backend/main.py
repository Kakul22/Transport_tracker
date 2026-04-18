from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import random
import math
from datetime import datetime
from eta_model import predict_eta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ROUTE = [
    {"lat": 28.6139, "lng": 77.2090, "stop": "Main Gate"},
    {"lat": 28.6150, "lng": 77.2110, "stop": "Library"},
    {"lat": 28.6165, "lng": 77.2130, "stop": "Hostel Block"},
    {"lat": 28.6180, "lng": 77.2150, "stop": "Canteen"},
    {"lat": 28.6200, "lng": 77.2170, "stop": "Sports Ground"},
]

current_index = 0
current_lat = ROUTE[0]["lat"]
current_lng = ROUTE[0]["lng"]
data_buffer = []

def get_distance(lat1, lng1, lat2, lng2):
    return math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2) * 111

@app.websocket("/ws/bus")
async def bus_location(websocket: WebSocket):
    global current_index, current_lat, current_lng, data_buffer
    await websocket.accept()
    print("Frontend connected!")

    if data_buffer:
        print(f"Sending {len(data_buffer)} buffered points")
        for buffered_data in data_buffer:
            await websocket.send_json(buffered_data)
        data_buffer = []

    try:
        while True:
            target = ROUTE[(current_index + 1) % len(ROUTE)]

            current_lat += (target["lat"] - current_lat) * 0.1
            current_lng += (target["lng"] - current_lng) * 0.1

            dist = get_distance(current_lat, current_lng, target["lat"], target["lng"])

            if dist < 0.01:
                current_index = (current_index + 1) % len(ROUTE)

            network = random.choice(["good", "good", "good", "medium", "poor"])
            speed = round(random.uniform(20, 40), 1)
            hour = datetime.now().hour

            network_num = {"good": 1, "medium": 2, "poor": 3}[network]
            eta = predict_eta(
                distance_km=dist,
                hour_of_day=hour,
                speed_kmh=speed,
                network_quality=network_num
            )

            data = {
                "lat": round(current_lat, 6),
                "lng": round(current_lng, 6),
                "speed": speed,
                "next_stop": target["stop"],
                "network_quality": network,
                "eta_minutes": eta
            }

            if network == "poor":
                await asyncio.sleep(3)
            elif network == "medium":
                await asyncio.sleep(1.5)
            else:
                await asyncio.sleep(1)

            await websocket.send_json(data)

    except WebSocketDisconnect:
        print("Disconnected — buffering...")
        for _ in range(10):
            target = ROUTE[(current_index + 1) % len(ROUTE)]
            current_lat += (target["lat"] - current_lat) * 0.1
            current_lng += (target["lng"] - current_lng) * 0.1
            data_buffer.append({
                "lat": round(current_lat, 6),
                "lng": round(current_lng, 6),
                "speed": round(random.uniform(20, 40), 1),
                "next_stop": target["stop"],
                "network_quality": "buffered",
                "eta_minutes": 0
            })
            await asyncio.sleep(0.5)

@app.get("/")
def root():
    return {"status": "Bus tracker running!"}