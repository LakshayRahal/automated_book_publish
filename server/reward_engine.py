
feedback_log = []
# rewardType like
def rewardall(feedback_type: str) -> float:
    mapr = {
        "accepted": 1.0,
        "edited": 0.5,
        "rejected": 0.0
    }
    return mapr.get(feedback_type.lower(), 0.0)

# feedback recording
def rec_feedback(version_id: str, feedback: str):
    reward = rewardall(feedback)
    feedback_log.append({
        "version_id": version_id,
        "feedback": feedback,
        "reward": reward
    })
    print(f"[+] Feedback stored: {version_id}, {feedback}, reward: {reward}")
    return reward


# updating rewarding
def get_same_rewards():
    reward_map = {}
    for entry in feedback_log:
        vid = entry["version_id"]
        reward_map[vid] = reward_map.get(vid, 0) + entry["reward"]
    return reward_map
