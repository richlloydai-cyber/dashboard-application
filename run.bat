@echo off
REM ============================================================
REM HERMES DASHBOARD - WINDOWS LAUNCHER
REM ============================================================
REM Run this from Windows (double-click, or from cmd/PowerShell):
REM
REM   cd %USERPROFILE%\.hermes\hermes-dashboard
REM   run.bat            build + start the full stack
REM   run.bat stop       stop the stack
REM   run.bat logs       tail logs
REM
REM Then open:  http://localhost:8080/projects
REM
REM Requires: Docker Desktop running.
REM ============================================================
setlocal

cd /d "%~dp0"

set CMD=%1
if "%CMD%"=="" set CMD=up

if /i "%CMD%"=="up"      goto up
if /i "%CMD%"=="start"   goto up
if /i "%CMD%"=="stop"    goto stop
if /i "%CMD%"=="down"    goto stop
if /i "%CMD%"=="logs"    goto logs
if /i "%CMD%"=="restart" goto restart
goto usage

:up
echo Building and starting Hermes Dashboard...
docker compose up -d --build
if errorlevel 1 goto err
echo.
echo   Dashboard:   http://localhost:8080/projects
echo   API health:  http://localhost:8080/projects/api/health
echo.
goto end

:stop
docker compose down
echo Stopped.
goto end

:logs
docker compose logs -f --tail=100
goto end

:restart
docker compose restart
goto end

:usage
echo Usage: run.bat [up^|stop^|logs^|restart]
goto end

:err
echo.
echo ERROR: docker compose failed. Is Docker Desktop running?
exit /b 1

:end
endlocal
