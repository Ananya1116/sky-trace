@echo off
title Magic Floor Alphabet Studio
echo ===================================================
echo   Starting Magic Floor Alphabet Studio...
echo ===================================================
start "" "http://localhost:8080"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
