@echo off
echo ====================================================
echo  BuildTrack-AI - Git Push Script
echo ====================================================
echo.
echo Step 1: Pausing OneDrive to avoid lock conflicts...
taskkill /f /im OneDrive.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Step 2: Clearing git locks...
del /f /q "%~dp0.git\index.lock" >nul 2>&1
del /f /q "%~dp0.git\config.lock" >nul 2>&1

echo Step 3: Staging all changes...
cd /d "%~dp0"
git add -A

echo Step 4: Committing...
git commit -m "feat: add Brevo and Resend HTTPS email API support to bypass cloud SMTP port blocks"

echo Step 5: Pushing to GitHub (will trigger Render auto-deploy)...
git push origin main

echo.
echo Step 6: Restarting OneDrive...
start "" "C:\Program Files\Microsoft OneDrive\OneDrive.exe"

echo.
echo ====================================================
echo  SUCCESS! Changes pushed to GitHub.
echo ====================================================
pause
