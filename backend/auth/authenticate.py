import json
import os


# 1. Get the absolute path to the directory where this script lives
script_dir = os.path.dirname(os.path.abspath(__file__))
# # 2. Move up one level to the Parent Folder
parent_dir = os.path.dirname(script_dir) 

USER_DB = os.path.join(parent_dir,'auth', 'users.json')

def load_users():
    if not os.path.exists(USER_DB):
        return {}
    with open(USER_DB, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USER_DB, 'w') as f:
        json.dump(users, f, indent=4)

