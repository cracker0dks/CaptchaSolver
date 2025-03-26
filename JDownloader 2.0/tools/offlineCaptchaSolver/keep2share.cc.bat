call checkdeps.bat

set "file=result.txt"
set "timeout=30"
set /a "elapsed=0"

if exist "%file%" del "%file%"

node.exe ocr.js keep2share.cc

:wait
if exist "%file%" (
    exit /b 0
)

if %elapsed% GEQ %timeout% (
    exit /b 1
)

timeout /t 1 >nul
set /a "elapsed+=1"
goto wait

timeout /t 1 >nul