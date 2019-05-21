@echo off
::::::::::::::::::::::::::::::::::::
::  Set JAVA_HOME or JRE_HOME     ::
::::::::::::::::::::::::::::::::::::
title %~0

IF EXIST tomcat\logs\catalina.pid (
	del /F/Q tomcat\logs\catalina.pid
) 

set TASKCMD=TASKLIST /V
set FINDCMD=FIND /I

FOR /F "tokens=2 delims= " %%A IN ('%TASKCMD% ^| %FINDCMD% "%~0"') DO SET MyPID=%%A

set KeyName=%JDKKeyName64%
goto JDKRUN

:JDKRUN
echo.
echo [WAIL]: Using JDK
set "CURRENT_DIR=%cd%"
:Use WAIL's Java7
set "JAVA_HOME="%CURRENT_DIR%\bundledApps\Java\Windows\jdk1.7.0_80\"

set "CATALINA_HOME=%CURRENT_DIR%\bundledApps\tomcat"

echo.
echo [WAIL]: Seems fine!
echo [WAIL]: Set JAVA_HOME : %JAVA_HOME%
echo [WAIL]: Set CATALINA_HOME : %CATALINA_HOME%
echo.

if %ERRORLEVEL% == 0 (
	echo %MyPID% > tomcat\logs\catalina.pid
)

"%CATALINA_HOME%\bin\catalina.bat" run
goto END

:JRERUN
echo.
echo [WAIL]: Using JRE
set "CURRENT_DIR=%cd%"
set "CATALINA_HOME=%CURRENT_DIR%\bundledApps\tomcat"

set Cmd=reg query "%KeyName%" /s
for /f "tokens=2*" %%i in ('%Cmd% ^| find "JavaHome"') do set JRE_HOME=%%j

echo.
echo [WAIL]: Seems fine!
echo [WAIL]: Set JRE_HOME : %JRE_HOME%
echo [WAIL]: Set CATALINA_HOME : %CATALINA_HOME%
echo.

if %ERRORLEVEL% == 0 (
	echo %MyPID% > tomcat\logs\catalina.pid
)

"%CATALINA_HOME%\bin\catalina.bat" run
goto END

:ENDERROR
exit 1

:END
echo done.
pause


