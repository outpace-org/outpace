import requests
import polyline

def fetch_elevations(coordinates: list[tuple[float, float]]) -> tuple[bool, list[float]]:
    URL = "https://api.open-elevation.com/api/v1/lookup"
    elevations = []
    for i in range(0, len(coordinates), 200):
        batch = coordinates[i:i+200]
        full_url = URL + "?locations=" + '|'.join([f"{lat},{lng}" for (lat, lng) in batch])
        print("full_url", full_url)
        res = requests.get(full_url)
        if res.status_code == 200:
            print("res", res)
            resu = res.json()
            elevations.extend([coords['elevation'] for coords in resu['results']])
        else:
            return False, []
    return True, elevations

def decode_polyline(s: str):
    return polyline.decode(s)
