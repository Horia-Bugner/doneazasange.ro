@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0refresh-image-pools.ps1"
if errorlevel 1 (
  echo.
  echo The image pools could not be refreshed.
) else (
  echo.
  echo Done. Refresh the website in your browser.
)
pause

