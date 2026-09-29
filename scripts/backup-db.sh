#!/bin/bash
set -e

BACKUP_DIR="/home/ubuntu/CN_Web/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/medusa_backup_${TIMESTAMP}.dump"

echo "[$(date)] Starting Medusa PostgreSQL automated backup..."
mkdir -p "${BACKUP_DIR}"

# Run pg_dump inside medusa-db docker container
docker exec medusa-db pg_dump -U postgres -d medusa -Fc > "${BACKUP_FILE}"

FILESIZE=$(ls -lh "${BACKUP_FILE}" | awk "{print \$5}")
echo "[$(date)] Backup completed successfully: ${BACKUP_FILE} (${FILESIZE})"

# Retention policy: Delete backups older than 14 days
echo "[$(date)] Cleaning backups older than 14 days..."
find "${BACKUP_DIR}" -name "medusa_backup_*.dump" -type f -mtime +14 -delete

echo "[$(date)] Backup rotation complete."
