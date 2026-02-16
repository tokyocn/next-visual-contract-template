#!/usr/bin/env bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h db -U postgres; do
  sleep 1
done

echo "Database initialized successfully."
