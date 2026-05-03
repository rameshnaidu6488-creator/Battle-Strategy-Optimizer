# ⚔️ Battle Strategy Optimizer

### Greedy vs Dynamic Programming Simulator

---

## 📌 Overview

**Battle Strategy Optimizer** is an interactive decision-making simulator designed to demonstrate how different algorithmic strategies perform in battle-like scenarios.

The system compares two key approaches:

* ⚡ **Greedy Algorithm** — fast, locally optimal decisions
* 🧠 **Dynamic Programming (DP)** — globally optimal decisions

Players manage limited resources such as soldiers and energy to defeat enemy bases efficiently. The simulator then evaluates and compares player choices with algorithmically optimal strategies.

---

## 🎯 Problem Statement

In constrained environments, decisions must be made under:

* Limited resources
* Multiple possible actions
* Trade-offs between risk and reward

👉 This project answers the question:
**“Is choosing the best immediate option always the best overall strategy?”**

---

## 🧠 Algorithms Used

### 🔹 Greedy Algorithm

* Selects the best immediate option
* Example strategies:

  * Attack weakest enemy first
  * Attack highest reward enemy first

**Pros:**
✔️ Fast and simple

**Cons:**
❌ Not always optimal

---

### 🔹 Dynamic Programming (0/1 Knapsack Approach)

* Evaluates all possible combinations
* Finds the optimal sequence of battles

**Pros:**
✔️ Guarantees maximum reward

**Cons:**
❌ More computationally intensive

---

## ⚙️ How It Works

### 1️⃣ Initialization

Player starts with:

* 🪖 Fixed number of soldiers
* ⚡ Limited energy

Enemies are generated with:

* Strength (cost)
* Reward (benefit)
* Risk level

---

### 2️⃣ Player Strategy

* User manually selects enemies **OR**
* Uses Greedy strategy for automatic selection

---

### 3️⃣ Greedy Execution

* Selects enemies based on:

  * Highest reward **OR** lowest cost
* Stops when resources are exhausted

---

### 4️⃣ Dynamic Programming Execution

* Uses **0/1 Knapsack algorithm**
* Computes:

  * Maximum achievable reward
  * Optimal combination of enemies

---

### 5️⃣ Result Comparison

| Strategy | Total Reward | Soldiers Remaining | Efficiency |
| -------- | ------------ | ------------------ | ---------- |
| Greedy   | XX           | XX                 | Medium     |
| DP       | XX           | XX                 | High       |

---

### 6️⃣ Insight Generation

The system explains:

* Why Greedy may fail
* How DP achieves better optimization

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python

### Algorithms

* Greedy (Sorting / Priority Selection)
* Dynamic Programming (0/1 Knapsack)

---

## 📈 Example Scenario

**Input:**

```
Soldiers = 100

Enemies:
A → Cost: 20, Reward: 40  
B → Cost: 50, Reward: 100  
C → Cost: 30, Reward: 60
```

**Greedy Result:**

* Picks highest reward first
* May block better future combinations

**DP Result:**

* Finds optimal combination
* Maximizes total reward

---

## 💡 Key Learning Outcomes

* Difference between **local vs global optimization**
* Real-world application of **Greedy and DP algorithms**
* Importance of **decision-making under constraints**

---

## ⭐ Final Note

This project is not just a game — it is a **visual and analytical demonstration of algorithmic thinking**, showing how smarter decisions lead to better outcomes.

---
