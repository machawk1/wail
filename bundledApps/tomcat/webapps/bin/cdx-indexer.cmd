@echo OFF
set here=%cd%
set libDir=

setlocal enableextensions disabledelayedexpansion

set "resolveDir=..\lib"

rem waybackhome = tomcat/webapps

rem With a subroutine
call :resolve "%resolveDir%" libDir
echo %libDir%
rem With a for - retrieve the full path of the file/folder being
rem              referenced by the for replaceable parameter
rem for %%f in ("%newDir%") do echo %%~ff
endlocal

echo %libDir%

Pushd %libDir%

set heret=%cd%

echo %heret%

popd
rem for /r "%libDir%" %%a in (*.jar) do (
rem     echo %%a
rem )


goto :EOF

:resolve file/folder returnVarName
rem Set the second argument (variable name)
rem to the full path to the first argument (file/folder)
set "%~2=%~f1"
goto :EOF
