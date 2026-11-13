@echo off
echo ============================================
echo  BuildTrack-AI - CORS Fix Git Push Script
echo ============================================
echo.
echo Step 1: Pausing OneDrive sync...
taskkill /f /im OneDrive.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Step 2: Clearing any git locks...
del /f /q "%~dp0.git\index.lock" >nul 2>&1
del /f /q "%~dp0.git\config.lock" >nul 2>&1

echo Step 3: Staging all changes...
cd /d "%~dp0"
git add "backend/src/main/java/com/buildtrack/ai/auth/security/SecurityConfig.java"
git add "backend/src/main/java/com/buildtrack/ai/config/CorsConfig.java"
git add "frontend/src/services/realtimeClient.js"

echo Step 4: Committing...
git commit -m "fix: resolve CORS preflight failures on Render - allow OPTIONS before auth"

echo Step 5: Pushing to remote...
git push origin main

echo.
echo Step 6: Restarting OneDrive...
start "" "%LOCALAPPDATA%\Microsoft\OneDrive\OneDrive.exe"

echo.
echo ============================================
echo  DONE! Check Render dashboard for deploy.
echo ============================================
pause
