@echo off
setlocal enableextensions

call %~dp0\env.cmd

if "%JAVA_DEBUG_OPTS%" == "" (
   set JAVA_DEBUG_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=1044
)

if "%JAVA_OPTS%" == "" (
   rem -XX:PermSize=64M -XX:MaxPermSize=256M
   set JAVA_OPTS=-Xms256m -Xmx1024m
)

%JAVA% %JAVA_DEBUG_OPTS% %JAVA_OPTS% -cp "%CP%" org.jwat.tools.JWATTools %*
