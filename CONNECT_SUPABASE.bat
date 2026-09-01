@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\prepare_supabase_activation.ps1"
if errorlevel 1 (
  echo.
  echo Khong the chuan bi ket noi. Xem thong bao o tren.
  pause
  exit /b 1
)
echo.
echo Cac buoc con lai da hien tren man hinh va SQL da nam trong clipboard.
pause

