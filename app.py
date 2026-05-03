"""
══════════════════════════════════════════════════════
BATTLE OPTIMIZER — TACTICAL RPG
app.py  —  Flask REST API Backend
══════════════════════════════════════════════════════
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import math
import time
import uuid
import os

app = Flask(__name__, static_folder="static")
CORS(app)

# ── IN-MEMORY SESSION STORE ────────────────────────────
sessions: dict = {}

# ── HELPERS ────────────────────────────────────────────

def troop_cost(hp: int) -> int:
    """Troops required to defeat an enemy with given HP."""
    return max(1, math.ceil(hp / 10))


def efficiency_ratio(atk: int, hp: int) -> float:
    """ATK/HP ratio — higher means better value target."""
    return atk / hp if hp > 0 else 0.0


# ── ALGORITHMS ────────────────────────────────────────

def greedy_optimize(troops: int, enemies: list[dict]) -> dict:
    """
    Greedy knapsack: sort enemies by ATK/HP ratio descending,
    engage highest-value targets first until out of troops.
    O(n log n)
    """
    sorted_enemies = sorted(
        enemies,
        key=lambda e: efficiency_ratio(e["atk"], e["hp"]),
        reverse=True,
    )
    troops_left = troops
    damage_neutralized = 0
    taken, skipped = [], []

    for e in sorted_enemies:
        cost = troop_cost(e["hp"])
        record = {**e, "cost": cost, "ratio": round(efficiency_ratio(e["atk"], e["hp"]), 4)}
        if troops_left >= cost:
            troops_left -= cost
            damage_neutralized += e["atk"]
            taken.append(record)
        else:
            skipped.append(record)

    troops_used = troops - troops_left
    return {
        "algo": "GREEDY",
        "troops_used": troops_used,
        "troops_remaining": troops_left,
        "damage_neutralized": damage_neutralized,
        "efficiency": round((damage_neutralized / troops) * 100, 2) if troops > 0 else 0,
        "taken": taken,
        "skipped": skipped,
    }


def dp_optimize(troops: int, enemies: list[dict]) -> dict:
    """
    0/1 Knapsack DP: maximise total ATK neutralized within troop budget.
    Capacity capped at 500 for performance.
    O(n * capacity)
    """
    capacity = min(troops, 500)
    n = len(enemies)
    items = [
        {**e, "weight": troop_cost(e["hp"]), "value": e["atk"]}
        for e in enemies
    ]

    dp = [0] * (capacity + 1)
    # Track choices per item/capacity for backtracking
    choice: list[list[bool]] = [[False] * (capacity + 1) for _ in range(n)]

    for i, item in enumerate(items):
        w_i = item["weight"]
        for w in range(capacity, w_i - 1, -1):
            with_item = dp[w - w_i] + item["value"]
            if with_item > dp[w]:
                dp[w] = with_item
                choice[i][w] = True

    # Backtrack to find selected items
    w = capacity
    taken, skipped = [], []
    for i in range(n - 1, -1, -1):
        item = items[i]
        record = {
            **enemies[i],
            "cost": item["weight"],
            "ratio": round(efficiency_ratio(item["atk"], item["hp"]), 4),
        }
        if choice[i][w]:
            taken.append(record)
            w -= item["weight"]
        else:
            skipped.append(record)

    troops_used = capacity - w
    damage_neutralized = dp[capacity]

    return {
        "algo": "DP",
        "troops_used": troops_used,
        "troops_remaining": troops - troops_used,
        "damage_neutralized": damage_neutralized,
        "efficiency": round((damage_neutralized / troops) * 100, 2) if troops > 0 else 0,
        "taken": taken,
        "skipped": skipped,
    }


# ── ROUTES ────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main game page."""
    return send_from_directory(".", "index.html")


@app.route("/api/optimize", methods=["POST"])
def optimize():
    """
    POST /api/optimize
    Body: {
        "troops": int,
        "enemies": [{"id": int, "name": str, "hp": int, "atk": int}, ...],
        "algorithms": ["dp", "greedy"]   # which algos to run
    }
    Returns: {
        "sim_id": str,
        "timestamp": float,
        "results": { "dp": {...}, "greedy": {...} }
    }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    troops = int(data.get("troops", 0))
    enemies = data.get("enemies", [])
    algorithms = data.get("algorithms", ["dp", "greedy"])

    # Validate
    if troops < 1:
        return jsonify({"error": "troops must be >= 1"}), 422
    if not enemies:
        return jsonify({"error": "enemies list is empty"}), 422
    if len(enemies) > 50:
        return jsonify({"error": "maximum 50 enemies per simulation"}), 422

    # Sanitise enemy fields
    clean_enemies = []
    for e in enemies:
        try:
            clean_enemies.append({
                "id": int(e.get("id", 0)),
                "name": str(e.get("name", "UNKNOWN"))[:24],
                "hp": max(1, int(e.get("hp", 1))),
                "atk": max(1, int(e.get("atk", 1))),
            })
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid enemy data"}), 422

    results = {}
    t0 = time.perf_counter()

    if "dp" in algorithms:
        results["dp"] = dp_optimize(troops, clean_enemies)

    if "greedy" in algorithms:
        results["greedy"] = greedy_optimize(troops, clean_enemies)

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

    sim_id = f"SIM-{str(uuid.uuid4())[:8].upper()}"
    payload = {
        "sim_id": sim_id,
        "timestamp": time.time(),
        "elapsed_ms": elapsed_ms,
        "troops": troops,
        "enemy_count": len(clean_enemies),
        "results": results,
    }

    # Persist in session store (capped at last 100)
    sessions[sim_id] = payload
    if len(sessions) > 100:
        oldest = next(iter(sessions))
        del sessions[oldest]

    return jsonify(payload), 200


@app.route("/api/simulate/preview", methods=["POST"])
def preview():
    """
    Quick preview endpoint — returns per-enemy stats without full DP.
    POST body: same as /api/optimize
    """
    data = request.get_json(force=True, silent=True) or {}
    troops = int(data.get("troops", 1))
    enemies = data.get("enemies", [])

    previews = []
    for e in enemies:
        hp = max(1, int(e.get("hp", 1)))
        atk = max(1, int(e.get("atk", 1)))
        cost = troop_cost(hp)
        previews.append({
            "id": e.get("id"),
            "name": e.get("name", "UNKNOWN"),
            "hp": hp,
            "atk": atk,
            "cost": cost,
            "ratio": round(efficiency_ratio(atk, hp), 4),
            "affordable": cost <= troops,
        })

    return jsonify({"previews": previews}), 200


@app.route("/api/session/<sim_id>", methods=["GET"])
def get_session(sim_id: str):
    """Retrieve a past simulation result by ID."""
    result = sessions.get(sim_id.upper())
    if not result:
        return jsonify({"error": "Simulation not found"}), 404
    return jsonify(result), 200


@app.route("/api/sessions", methods=["GET"])
def list_sessions():
    """List all stored simulation IDs (most recent last)."""
    return jsonify({
        "count": len(sessions),
        "sim_ids": list(sessions.keys()),
    }), 200


@app.route("/api/sessions", methods=["DELETE"])
def clear_sessions():
    """Clear all stored simulations."""
    sessions.clear()
    return jsonify({"message": "All sessions cleared"}), 200


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "version": "2.4.0",
        "active_sessions": len(sessions),
    }), 200


# ── ENTRY POINT ────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    print(f"""
╔══════════════════════════════════════╗
║  BATTLE OPTIMIZER  —  API Server     ║
║  http://localhost:{port}               ║
║  ENV: {'development' if debug else 'production  '}                  ║
╚══════════════════════════════════════╝
    """)
    app.run(host="0.0.0.0", port=port, debug=debug)
