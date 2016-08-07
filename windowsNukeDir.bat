@echo off
echo %1
rmdir /s /q %1

exit /B %errorlevel%