@echo off
echo ========================================
echo Frontend Test Server Setup
echo ========================================
echo.
echo This will help you test the website with backend integration.
echo.
echo Requirements:
echo 1. WAMP server must be running
echo 2. PHP backend must be accessible at: http://localhost/php-backend/api
echo.
echo Choose an option:
echo [1] Copy to WAMP www directory (recommended)
echo [2] Start HTTP server on port 3000
echo [3] Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto wamp
if "%choice%"=="2" goto serve
if "%choice%"=="3" goto end
goto invalid

:wamp
echo.
echo Copying files to WAMP www directory...
set /p wampdir="Enter folder name in www (e.g., frontend-test): "
if "%wampdir%"=="" set wampdir=frontend-test

xcopy /E /I /Y "out\*" "C:\wamp64\www\%wampdir%\"
if %errorlevel%==0 (
    echo.
    echo ========================================
    echo SUCCESS!
    echo ========================================
    echo Files copied to: C:\wamp64\www\%wampdir%\
    echo.
    echo Access your website at:
    echo http://localhost/%wampdir%/
    echo.
    echo Make sure your PHP backend is running at:
    echo http://localhost/php-backend/api
    echo.
) else (
    echo.
    echo ERROR: Failed to copy files. Check permissions.
)
goto end

:serve
echo.
echo Starting HTTP server on port 3000...
echo.
echo Access your website at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
npm run serve:out
goto end

:invalid
echo.
echo Invalid choice. Please try again.
goto end

:end
pause


