@echo off

if "%OS%" == "Windows_NT" goto WinNT

:Win9X
echo Don't be stupid! Win9x don't know Services
goto exit

:WinNT

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

set Cmd=reg query "%KeyName%" /s
for /f "tokens=2*" %%i in ('%Cmd% ^| find "JavaHome"') do set JAVA_HOME=%%j

echo.
echo [XAMPP]: Seems fine!
echo [XAMPP]: Using %JAVA_HOME%
echo.
 
set JRE_HOME=%JAVA_HOME%

echo [XAMPP]: Using JAVA_HOME=%JAVA_HOME%
echo [XAMPP]: Using CATALINA_HOME=%CATALINA_HOME%
echo [XAMPP]: Using JRE_HOME=%JRE_HOME%

echo Installing Tomcat as an Service
.\bin\service.bat install Tomcat7


goto exit

:END

:exit

