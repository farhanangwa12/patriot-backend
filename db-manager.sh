#!/bin/bash

# ========================================
# Load .env file
# ========================================
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found!"
  exit 1
fi

# ========================================
# Menu Interaktif
# ========================================
while true; do
  clear
  echo "========================================"
  echo " PostgreSQL Database Manager"
  echo "========================================"
  echo "[1] Create Database & User"
  echo "[2] Delete Database & User"
  echo "[3] Recreate Database"
  echo "[4] Exit"
  echo "========================================"
  read -p "Choose option (1-4): " choice

  case $choice in
    1)
      echo "Creating user and database..."
      sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
      sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
      echo "Done!"
      read -p "Press enter to continue..."
      ;;
    2)
      echo "Deleting database and user..."
      sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
      sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
      echo "Done!"
      read -p "Press enter to continue..."
      ;;
    3)
      echo "Forcing disconnect users from $DB_NAME..."
      sudo -u postgres psql -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"
      echo "Recreating database..."
      sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
      sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
      echo "Done!"
      read -p "Press enter to continue..."
      ;;
    4)
      echo "Exiting..."
      exit 0
      ;;
    *)
      echo "Invalid option!"
      read -p "Press enter to continue..."
      ;;
  esac
done
