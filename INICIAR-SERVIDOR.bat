@echo off
title EduCRM - Servidor Backend
cd /d "%~dp0backend"
echo.
echo ========================================
echo   Iniciando EduCRM Backend...
echo ========================================
echo.
node server.js
pause
