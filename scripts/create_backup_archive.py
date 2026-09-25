import os
import sys
import tarfile
import zipfile
import json
import hashlib
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKUP_DIR = os.path.join(ROOT_DIR, "public", "backup")
os.makedirs(BACKUP_DIR, exist_ok=True)

ZIP_PATH = os.path.join(BACKUP_DIR, "7seasonsplants-full-site-backup.zip")
TAR_PATH = os.path.join(BACKUP_DIR, "7seasonsplants-full-site-backup.tar.gz")

# Allowed top-level directories and files
INCLUDE_DIRS = [
    "src",
    "server",
    "public",
    "database_backup",
    "scripts",
]

INCLUDE_FILES = [
    "server.ts",
    "index.html",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "vercel.json",
    "metadata.json",
    "firebase-applet-config.json",
    "firebase-blueprint.json",
    "firestore.rules",
    ".env.example",
    "README.md",
    "SEASONS.png",
]

# Patterns or paths to ignore
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    ".cache",
    ".vite",
    "__pycache__",
}

def should_include_file(rel_path):
    # Don't include the backup directory inside itself!
    if rel_path.startswith("public/backup"):
        return False
    parts = rel_path.split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return False
    # Avoid scratch/test files
    filename = os.path.basename(rel_path)
    if filename.startswith("out-") or filename.endswith(".pyc"):
        return False
    return True

print("Collecting files for full site backup...")
all_files = []

for dir_name in INCLUDE_DIRS:
    abs_dir = os.path.join(ROOT_DIR, dir_name)
    if not os.path.exists(abs_dir):
        continue
    for root, dirs, files in os.walk(abs_dir):
        # Filter out excluded directories in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not (dir_name == "public" and d == "backup")]
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            if should_include_file(rel_path):
                all_files.append((full_path, rel_path))

for file_name in INCLUDE_FILES:
    full_path = os.path.join(ROOT_DIR, file_name)
    if os.path.isfile(full_path):
        rel_path = os.path.relpath(full_path, ROOT_DIR)
        all_files.append((full_path, rel_path))

# Sort file list
all_files.sort(key=lambda x: x[1])

print(f"Total files to include in backup: {len(all_files)}")

# 1. Create ZIP Archive
print(f"Creating ZIP archive: {ZIP_PATH} ...")
with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zipf:
    for full_path, rel_path in all_files:
        # Prefix with archive root folder name for clean extraction
        arcname = os.path.join("7seasonsplants-backup", rel_path)
        zipf.write(full_path, arcname)

zip_size = os.path.getsize(ZIP_PATH)
print(f"ZIP archive created successfully! Size: {zip_size / 1024 / 1024:.2f} MB")

# 2. Create TAR.GZ Archive
print(f"Creating TAR.GZ archive: {TAR_PATH} ...")
with tarfile.open(TAR_PATH, "w:gz") as tarf:
    for full_path, rel_path in all_files:
        arcname = os.path.join("7seasonsplants-backup", rel_path)
        tarf.add(full_path, arcname=arcname)

tar_size = os.path.getsize(TAR_PATH)
print(f"TAR.GZ archive created successfully! Size: {tar_size / 1024 / 1024:.2f} MB")

# Calculate SHA256 hashes
def get_sha256(path):
    sha = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()

# Load database stats if available
db_stats = {}
db_backup_path = os.path.join(ROOT_DIR, "database_backup", "full_database_backup.json")
if os.path.exists(db_backup_path):
    try:
        with open(db_backup_path, "r", encoding="utf-8") as f:
            db_data = json.load(f)
            db_stats = db_data.get("stats", {})
    except Exception as e:
        print("Could not read db stats:", e)

manifest = {
    "appName": "7Seasonsplants",
    "backupDate": datetime.utcnow().isoformat() + "Z",
    "totalFiles": len(all_files),
    "zipArchive": {
        "filename": "7seasonsplants-full-site-backup.zip",
        "sizeBytes": zip_size,
        "sizeFormatted": f"{zip_size / 1024 / 1024:.2f} MB",
        "sha256": get_sha256(ZIP_PATH),
        "downloadUrl": "/backup/7seasonsplants-full-site-backup.zip",
    },
    "tarArchive": {
        "filename": "7seasonsplants-full-site-backup.tar.gz",
        "sizeBytes": tar_size,
        "sizeFormatted": f"{tar_size / 1024 / 1024:.2f} MB",
        "sha256": get_sha256(TAR_PATH),
        "downloadUrl": "/backup/7seasonsplants-full-site-backup.tar.gz",
    },
    "databaseCollections": db_stats,
    "directoriesIncluded": INCLUDE_DIRS,
    "sampleIncludedFiles": [rel for _, rel in all_files[:25]],
}

manifest_path = os.path.join(BACKUP_DIR, "backup-manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print("Backup Manifest written to:", manifest_path)
print("Complete Backup Finished Successfully!")
