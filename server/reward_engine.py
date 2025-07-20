import numpy as np
import json
import os
#  getting access of the json file
tab_q = "q_table.json"

# Load Q-table if it exists
if os.path.exists(tab_q):
    with open(tab_q, "r") as f:
        q_table = json.load(f)
else:
    q_table = {}

# Convert feedback type to numeric reward
def rew_vd(feedback: str) -> float:
    return {
        "accepted": 1.0,
        "edited": 0.5,
        "rejected": 0.0
    }.get(feedback.lower(), 0.0)

# Simple state feature extractor
def ext_feat(tt: str) -> str:
    words = tt.split()
    return f"len={len(words)}"

# Q-learning update function
def upd_qtable(version_id: str, feedback: str, tt: str):
    st = ext_feat(tt)
    act = feedback
    reward = rew_vd(feedback)

    if st not in q_table:
        q_table[st] = {}
    if act not in q_table[st]:
        q_table[st][act] = 0.0
    # // learning rate
    lr = 0.1

   
    current_q = q_table[st][act]
    calc=lr*(reward-current_q);
    q_table[st][act] = current_q +calc

    # Save the updated Q-table
    with open(tab_q, "w") as f:
        # dumping into json 
        json.dump(q_table, f, indent=2)

    print(f"[Updated Q[{st}][{act}] = {q_table[st][act]}")
    return reward

# Ranking: get max Q-value for a given text
def get_pdt_re(txt: str) -> float:
    st = ext_feat(txt)
    act = q_table.get(st, {})
    if(act):
        return max(act.values());
    else:
        return 0.0;