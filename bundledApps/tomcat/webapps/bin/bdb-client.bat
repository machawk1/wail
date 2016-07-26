@echo OFF
@setlocal

set PRGDIR=%cd%
set JAVA_OPTS=-Xmx256m
set main=org.archive.wayback.resourceindex.bdb.BDBIndex
set cp=
set "resolveDir=%~dp0..\lib"
set "jh=%~dp0..\..\..\openjdk"
set "jcmd=%~dp0..\..\..\openjdk\bin\java"
set "jreh=%~dp0..\..\..\openjdk\jre"
set "wbh=%~dp0.."

call :resolve "%resolveDir%" libDir
call :resolve "%jh%" JAVA_HOME
call :resolve "%jcmd%" JAVACMD
call :resolve "%jreh%" JRE_HOME
call :resolve "%wbh%" WAYBACK_HOME

pushd %libDir%
REM chdir %libDir%
for %%f in (*.jar) do call :addToPath %libDir%\%%f
popd
REM chdir %PRGDIR%

%JAVACMD% -cp %cp% %main% %*

goto end

:addToPath
set cp=%1;%cp%
goto :eof

:resolve
set "%~2=%~f1"
goto :eof

:end
exit /B %errorlevel%
