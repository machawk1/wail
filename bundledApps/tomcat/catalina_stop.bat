@echo off
::::::::::::::::::::::::::::::::::::
::  Set JAVA_HOME and   ::
::::::::::::::::::::::::::::::::::::


echo.
echo [WAIL]: Searching JDK HOME with reg query ...
set KeyName=HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\Java Development Kit

reg query "%KeyName%" /s
if %ERRORLEVEL% == 1 (
  echo . [WAIL]: Cannot find current JDK installation!
  echo . [WAIL]: Cannot set JAVA_HOME. Aborting ...
  goto :END
)

set "CURRENT_DIR=%cd%"
set "CATALINA_HOME=%CURRENT_DIR%"

set Cmd=reg query "%KeyName%" /s
for /f "tokens=2*" %%i in ('%Cmd% ^| find "JavaHome"') do set JAVA_HOME=%%j

echo.
echo [WAIL]: Seems fine!
echo [WAIL]: Using JAVA_HOME : %JAVA_HOME%
echo [WAIL]: Using CATALINA_HOME : %CATALINA_HOME%
echo.

if %ERRORLEVEL% == 0 {
del /F/Q logs\catalina.pid
}

"%CATALINA_HOME%\bin\catalina.bat" stop


:END
echo done.
pause
