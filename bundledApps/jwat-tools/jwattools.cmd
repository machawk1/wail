@echo off
setlocal enableextensions

call %~dp0\env.cmd

if "%JAVA_OPTS%" == "" (
   rem -XX:PermSize=64M -XX:MaxPermSize=256M
   set JAVA_OPTS=-Xms256m -Xmx1024m
)

%JAVA% %JAVA_OPTS% -cp "%CP%" org.jwat.tools.JWATTools %*
