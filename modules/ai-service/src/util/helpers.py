import requests
import json
import os

def publish_notification(message: str, type: str, jobId: str, owner: str, title: str):
    NOTIFICATION_SVC_URL = os.getenv("NOTIFICATION_SVC_URL")
    if NOTIFICATION_SVC_URL is None:
        print("Notification service URL is not set.")
        return
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    payload = {
        'message': message,
        'type': type,
        'jobId': jobId,
        'owner': owner,
        'title': title
    }

    try:
        response = requests.post(NOTIFICATION_SVC_URL, headers=headers, data=json.dumps(payload))
        if response.status_code == 201:
            print("Notification sent successfully.")
        else:
            print(f"Failed to send notification. Status code: {response.status_code}, Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while sending notification: {e}")