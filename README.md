Battle Strategy Optimizer
Greedy vs Dynamic Programming Simulator
# Overview
Battle Strategy Optimizer is an interactive decision-making simulator that demonstrates how different algorithmic strategies perform in real-world-like battle scenarios.
The system compares:
#Greedy Approach (fast, local decisions)
>> Dynamic Programming (DP) (optimal, global decisions)
Players are given limited resources (soldiers, energy) and must decide how to defeat enemy bases efficiently. The system then evaluates and compares the player’s strategy with algorithmically optimal solutions.
>> Problem Statement
In constrained environments (like battles), decisions must be made under:
Limited resources
Multiple choices
Trade-offs between risk and reward
. This project answers:
“Is choosing the best immediate option always the best overall strategy?”
> Algorithms Used
🔹 Greedy Algorithm
Selects the best immediate option
Example strategies:
Attack weakest enemy first
Attack highest reward enemy first
✔️ Fast and simple
> Not always optimal
🔹 Dynamic Programming (0/1 Knapsack Approach)
Evaluates all possible combinations
Finds the optimal sequence of battles
> Guarantees maximum reward
> More computationally intensive
# How It Works (Step-by-Step)
1️⃣ Initialization
Player starts with:
. Fixed number of soldiers
. Limited energy
Enemies are generated with:
Strength (cost)
Reward (benefit)
Risk level
2️⃣ Player Strategy
User selects enemies manually or
Uses Greedy strategy for automatic selection
3️⃣ Greedy Execution
System selects enemies based on:
Highest reward OR lowest cost
Stops when resources are exhausted
4️⃣ Dynamic Programming Execution
Uses Knapsack-based DP
Computes:
Maximum achievable reward
Best combination of enemies
5️⃣ Result Comparison
The system displays:
Strategy
Total Reward
Soldiers Remaining
Efficiency
Greedy
XX
XX
Medium
DP
XX
XX
High
# Insight Generation
The system explains:
Why Greedy failed (if it did)
How DP achieved better optimization.
# Tech Stack
Frontend:
HTML, CSS, JavaScript 
Backend:
Python
Algorithms:
Greedy (Sorting / Priority Selection)
Dynamic Programming (0/1 Knapsack)
📈 Example Scenario
Input:

Soldiers = 100

Enemies:
A → Cost: 20, Reward: 40  
B → Cost: 50, Reward: 100  
C → Cost: 30, Reward: 60
Greedy Result:
Picks highest reward first → may reduce future options
DP Result:
Finds optimal combination → maximizes total reward
# Key Learning Outcomes
Difference between local vs global optimization
Real-world application of Greedy & DP algorithms
Importance of decision-making under constraints.
# Final Note
This project is not just a game — it is a visual and analytical demonstration of algorithmic thinking, showing how smarter decisions lead to better outcomes.
