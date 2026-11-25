@echo off
title JanSahayak AI - Public Grievance Redressal Portal
cd /d "%~dp0"
echo ========================================================
echo   JanSahayak AI (जनसहायक AI)
echo   Public Grievance Reporting and Tracking System
echo ========================================================
echo.
echo Starting web server at http://localhost:5000 ...
echo Press Ctrl+C in this window to stop the server.
echo.
start "" "http://localhost:5000"
call .\node.cmd server/index.js
pause
