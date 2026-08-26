@echo off
setlocal EnableExtensions
chcp 65001 >nul

cd /d "%~dp0"
title Twogether - Thu ban moi nhat

set "TW_PORT=4174"
set "TW_URL=http://127.0.0.1:%TW_PORT%/"
set "TW_NODE=node"
set "TW_NPM_CLI=%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js"

where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    set "TW_NODE=%ProgramFiles%\nodejs\node.exe"
  ) else (
    echo.
    echo [LOI] Chua tim thay Node.js.
    echo Hay cai Node.js LTS, sau do chay lai file nay.
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
  )
)

if not exist "%TW_NPM_CLI%" (
  where npm >nul 2>nul
  if errorlevel 1 (
    echo.
    echo [LOI] Chua tim thay npm.
    echo Hay cai lai Node.js LTS, sau do chay lai file nay.
    echo.
    pause
    exit /b 1
  )
  set "TW_USE_NPM_COMMAND=1"
)

echo.
echo ================================================
echo   TWogether - thu ban build moi tren may
echo ================================================
echo.
echo Ban thu se chay tai: %TW_URL%
echo Cong 4174 duoc dung de tranh cache cua ban cu.
echo Du lieu hoc tren web da deploy se KHONG bi xoa.
echo.

if not exist "node_modules\vite\bin\vite.js" (
  echo [1/3] Dang cai dependency lan dau...
  call :npm install
  if errorlevel 1 goto :failed
) else (
  echo [1/3] Dependency da san sang.
)

echo [2/3] Dang build ban production moi nhat...
call :npm run build
if errorlevel 1 goto :failed

if /I "%~1"=="--check" (
  echo.
  echo [OK] Build thanh cong. Che do --check khong mo web.
  exit /b 0
)

echo [3/3] Dang mo web thu...
echo.
echo Sau khi web mo, chon Hiep hoac Hoang, sau do o ngay muc HOC.
echo Kiem tra 10 bo English Core, moi bo 8 the.
echo.
echo De dung server, quay lai cua so nay va nhan Ctrl+C.
echo Khong can xoa cache hay localStorage.
echo.

start "" /b powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process '%TW_URL%'"
call :npm run preview -- --host 127.0.0.1 --port %TW_PORT% --strictPort
exit /b %errorlevel%

:npm
if defined TW_USE_NPM_COMMAND (
  call npm %*
) else (
  "%TW_NODE%" "%TW_NPM_CLI%" %*
)
exit /b %errorlevel%

:failed
echo.
echo [LOI] Khong the tao ban thu. Hay chup man hinh loi trong cua so nay gui cho AI.
echo.
pause
exit /b 1
