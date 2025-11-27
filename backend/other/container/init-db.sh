#!/bin/bash
set -euo pipefail

: "${SA_PASSWORD:?SA_PASSWORD must be set}"

SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
HOST="${MSSQL_HOST:-mssql}"

echo "waiting for mssql at ${HOST}..."
start_ts=$(date +%s)
timeout_seconds=120

while true; do
  if ${SQLCMD} -C -S "${HOST}" -U SA -P "$SA_PASSWORD" -Q 'select 1' > /dev/null 2>&1; then
    echo "mssql is available"
    break
  fi
  now_ts=$(date +%s)
  elapsed=$((now_ts - start_ts))
  if [ "$elapsed" -ge "$timeout_seconds" ]; then
    echo "ERROR: timed out waiting for mssql after ${timeout_seconds}s" >&2
    exit 1
  fi
  sleep 2
done

echo "executing init.sql"
if ! ${SQLCMD} -C -S "${HOST}" -U SA -P "$SA_PASSWORD" -i /init.sql; then
  echo "ERROR: failed to execute /init.sql" >&2
  exit 2
fi
echo "init finished"
