@echo off
::::::::::::::::::::::::::::::::::::
::  Set JAVA_HOME and   ::
::::::::::::::::::::::::::::::::::::

IF EXIST tomcat\logs\catalina.pid (
  del /F/Q tomcat\logs\catalina.pid
) 

echo.
echo [XAMPP]: Searching JDK HOME with reg query ...
set KeyName=HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\Java Development Kit

reg query "%KeyName%" /s
if %ERRORLEVEL% == 1 (
  echo . [XAMPP]: Cannot find current JDK installation! 
  echo . [XAMPP]: Cannot set JAVA_HOME. Aborting ...
  goto :END
)

set "CURRENT_DIR=%cd%"
set "CATALINA_HOME=%CURRENT_DIR%"

:: only for windows 32 bit if you have problems with the tcnative-1.dll
:: set CATALINA_OPTS=-Djava.library.path="%CATALINA_HOME%\bin"

set Cmd=reg query "%KeyName%" /s
for /f "tokens=2*" %%i in ('%Cmd% ^| find "JavaHome"') do set JAVA_HOME=%%j

echo.
echo [XAMPP]: Seems fine!
echo [XAMPP]: Set JAVA_HOME : %JAVA_HOME%
echo [XAMPP]: Set CATALINA_HOME : %CATALINA_HOME%
echo.

if %ERRORLEVEL% == 0 (
echo run > logs\catalina.pid
)

"%CATALINA_HOME%\bin\catalina.bat" run


:END
echo done.
pause
