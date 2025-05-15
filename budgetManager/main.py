
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import json, os

app = FastAPI()
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

@app.get("/api/getBudgets")
def get_budgets():
    try:
        with open(f"{DATA_DIR}/budgets.json", "r") as f:
            return json.load(f)
    except:
        return {}

@app.post("/api/updateBudgets")
async def update_budgets(request: Request):
    data = await request.json()
    with open(f"{DATA_DIR}/budgets.json", "w") as f:
        json.dump(data, f, indent=2)
    return {"success": True}

# 정적 파일 서빙
app.mount("/", StaticFiles(directory="static", html=True), name="static")
