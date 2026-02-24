@echo off
echo Installing Fly CLI...
powershell -Command "Invoke-WebRequest -Uri 'https://fly.io/install.ps1' -OutFile '%TEMP%\fly_install.ps1' -UseBasicParsing"
powershell -ExecutionPolicy Bypass -File "%TEMP%\fly_install.ps1"
echo.
echo Fly CLI installed! Please restart your terminal.
echo.
pause
