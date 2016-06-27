@echo off 
set here=%cd%
set JAVA_HOME=%here%/openjdk
set JRE_HOME=%here%/openjdk/jre
set CATALINA_HOME=%here%/tomcat
set start=%CATALINA_HOME%/bin/startup.bat
set stop=%CATALINA_HOME%/bin/shutdown.bat

if "%1" == "start" goto runWayback
if "%1" == "stop" goto killWayback

:runWayback
echo Starting Wayback
%start%
goto end

:killWayback
echo Killing Wayback
%stop%
goto end

:end