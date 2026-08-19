@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0refresh-faqs.ps1"
if errorlevel 1 (
  echo.
  echo The FAQ could not be refreshed. Close FAQ-site.xlsx if it is open and try again.
) else (
  echo.
  echo Done. FAQ-LATEST.html has been updated.
)
pause
