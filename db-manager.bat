@echo off
REM ========================================
REM Load .env file
REM ========================================
setlocal enabledelayedexpansion
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if "%%a"=="DB_NAME" set "DB_NAME=%%b"
    if "%%a"=="DB_USER" set "DB_USER=%%b"
    if "%%a"=="DB_PASS" set "DB_PASS=%%b"
)

REM ========================================
REM Menu Interaktif
REM ========================================
:menu
cls
echo ========================================
echo PostgreSQL Database Manager
echo ========================================
echo [1] Create Database ^& User
echo [2] Delete Database ^& User
echo [3] Recreate Database
echo [4] Exit
echo ========================================
set /p choice=Choose option (1-4): 

if "%choice%"=="1" goto create
if "%choice%"=="2" goto delete
if "%choice%"=="3" goto recreate
if "%choice%"=="4" exit
goto menu

:create
echo Creating user and database...
psql -U postgres -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASS%';"
psql -U postgres -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;"
echo Done!
pause
goto menu

:delete
echo Deleting database and user...
psql -U postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;"
psql -U postgres -c "DROP USER IF EXISTS %DB_USER%;"
echo Done!
pause
goto menu

:recreate
echo Forcing disconnect users from %DB_NAME%...
psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '%DB_NAME%' AND pid <> pg_backend_pid();"
echo Recreating database...
psql -U postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;"
psql -U postgres -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;"
echo Done!
pause
goto menu
