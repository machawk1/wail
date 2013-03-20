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

echo.
echo [XAMPP]: Searching for JDK or JRE HOME with reg query ...
set JDKKeyName64=HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\Java Development Kit
set JDKKeyName32=HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\JavaSoft\Java Development Kit
set JREKeyName64=HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\Java Runtime Environment
set JREKeyName32=HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\JavaSoft\Java Runtime Environment

reg query "%JDKKeyName64%" /s
if %ERRORLEVEL% EQU 1 (
	echo . [XAMPP]: Could not find 32 bit or 64 bit JDK
	echo . [XAMPP]: Looking for 32 bit JDK on 64 bit machine
	goto FINDJDK32
)
set KeyName=%JDKKeyName64%
goto JDKRUN

:FINDJDK32
reg query "%JDKKeyName32%" /s
if %ERRORLEVEL% EQU  1 (
	echo . [XAMPP]: Could not find 32 bit JDK
	echo . [XAMPP]: Looking for 32 bit or 64 bit JRE
	goto FINDJRE64
)
set KeyName=%JDKKeyName32%
goto JDKRUN

:FINDJRE64
reg query "%JREKeyName64%" /s
if %ERRORLEVEL% EQU 1 (
	echo . [XAMPP]: Could not find 32 bit or 64 bit JRE 
	echo . [XAMPP]: Looking for 32 bit JRE on 64 bit machine
	goto FINDJRE32
)
set KeyName=%JREKeyName64%
goto JRERUN

:FINDJRE32
reg query "%JREKeyName32%" /s
if %ERRORLEVEL% EQU 1 (
	echo . [XAMPP]: Could not find 32 bit JRE
	echo . [XAMPP]: Could not set JAVA_HOME or JRE_HOME. Aborting
	goto ENDERROR
)
set KeyName=%JREKeyName32%
goto JRERUN

:JDKRUN
echo.
echo [XAMPP]: Using JDK
set "CURRENT_DIR=%cd%"
set "CATALINA_HOME=%CURRENT_DIR%\tomcat"

set Cmd=reg query "%KeyName%" /s
for /f "tokens=2*" %%i in ('%Cmd% ^| find "JavaHome"') do set JAVA_HOME=%%j

echo.
echo [XAMPP]: Seems fine!
echo [XAMPP]: Set JAVA_HOME : %JAVA_HOME%
echo [XAMPP]: Set CATALINA_HOME : %CATALINA_HOME%
echo.

if %ERRORLEVEL% == 0 (
	echo %MyPID% > tomcat\logs\catalina.pid
)

"%CATALINA_HOME%\bin\catalina.bat" run
goto END

:JRERUN
echo.
echo [XAMPP]: Using JRE
set "CURRENT_DIR=%cd%"
set "CATALINA_HOME=%CURRENT_DIR%\tomcat"

set Cmd=reg query "%KeyName%" /s
for /f "tokens=2*" %%i in ('%Cmd% ^| find "JavaHome"') do set JRE_HOME=%%j

echo.
echo [XAMPP]: Seems fine!
echo [XAMPP]: Set JRE_HOME : %JRE_HOME%
echo [XAMPP]: Set CATALINA_HOME : %CATALINA_HOME%
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


