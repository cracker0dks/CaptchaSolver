@echo off
cd /d "%~dp0"
if exist node_modules (
    echo "Dependencies are installed."
) else (
    echo "node_modules missing, attempting npm ci..."
    npm ci
)