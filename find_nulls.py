import os

def find_null_bytes(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.next' in dirs:
            dirs.remove('.next')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.json', '.prisma', '.css')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'rb') as f:
                        if b'\0' in f.read():
                            print(f"NULL BYTE FOUND: {path}")
                except Exception as e:
                    print(f"Error reading {path}: {e}")

if __name__ == "__main__":
    find_null_bytes("d:/School Management")
