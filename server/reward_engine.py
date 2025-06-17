
feedback_log = []

def assign_reward(feedback_type: str) -> float:
    reward_map = {
        "accepted": 1.0,
        "edited": 0.5,
        "rejected": 0.0
    }
    return reward_map.get(feedback_type.lower(), 0.0)

def record_feedback(version_id: str, feedback: str):
    reward = assign_reward(feedback)
    feedback_log.append({
        "version_id": version_id,
        "feedback": feedback,
        "reward": reward
    })
    print(f"[+] Feedback stored: {version_id}, {feedback}, reward: {reward}")
    return reward

def get_cumulative_rewards():
    reward_map = {}
    for entry in feedback_log:
        vid = entry["version_id"]
        reward_map[vid] = reward_map.get(vid, 0) + entry["reward"]
    return reward_map
