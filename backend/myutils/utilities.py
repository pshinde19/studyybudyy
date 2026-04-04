import os




# 1. Get the absolute path to the directory where this script lives
script_dir = os.path.dirname(os.path.abspath(__file__))
# # 2. Move up one level to the Parent Folder
parent_dir = os.path.dirname(script_dir) 


UPLOAD_FOLDER = 'user_documents'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def loadmetadata(user_name):
    try:
        # Construct the absolute path to the user's directory
        user_dir = os.path.join(parent_dir,UPLOAD_FOLDER, user_name)
        #print('user_dir',user_dir)
        # 1. Security Check: Ensure the directory exists
        if not os.path.exists(user_dir):
            return None,'',404
        # 2. List all items and filter out directories
        files = [
            f for f in os.listdir(user_dir) 
            if os.path.isfile(os.path.join(user_dir, f))
        ]
        return files,None,None
    except Exception as e:
        print(e)
        return None,str(e),500
