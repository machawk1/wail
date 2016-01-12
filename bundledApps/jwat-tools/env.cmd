@ECHO OFF
REM If JAVA_HOME is not set, use java.exe in execution path
if "%JAVA_HOME%" == "" (
   set JAVA=java
) else (
   set JAVA="%JAVA_HOME%\bin\java"
)

REM JWATTOOLS_HOME must point to home directory of JWAT-Tools install.
SET JWATTOOLS_HOME=%~dp0

REM CP must contain a semicolon-separated list of JARs used by JWAT-Tools.
SET CP=%JWATTOOLS_HOME%
FOR /R %JWATTOOLS_HOME%/lib %%a in (*.jar) DO CALL :AddToPath %%a
REM ECHO %CP%
GOTO :EOF

:AddToPath
SET CP=%CP%;%1
GOTO :EOF
