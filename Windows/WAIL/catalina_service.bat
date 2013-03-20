@echo off
rem Licensed to the Apache Software Foundation (ASF) under one or more
rem contributor license agreements.  See the NOTICE file distributed with
rem this work for additional information regarding copyright ownership.
rem The ASF licenses this file to You under the Apache License, Version 2.0
rem (the "License"); you may not use this file except in compliance with
rem the License.  You may obtain a copy of the License at
rem
rem     http://www.apache.org/licenses/LICENSE-2.0
rem
rem Unless required by applicable law or agreed to in writing, software
rem distributed under the License is distributed on an "AS IS" BASIS,
rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
rem See the License for the specific language governing permissions and
rem limitations under the License.

if "%OS%" == "Windows_NT" setlocal
rem ---------------------------------------------------------------------------
rem NT Service Install/Uninstall script
rem
rem Options
rem install                Install the service using Tomcat7 as service name.
rem                        Service is installed using default settings.
rem remove                 Remove the service from the System.
rem
rem name        (optional) If the second argument is present it is considered
rem                        to be new service name
rem
rem $Id: service.bat 1000718 2010-09-24 06:00:00Z mturk $
rem ---------------------------------------------------------------------------

rem ---------XAMPP-------------------------------------------------------------
::::::::::::::::::::::::::::::::::::
::  Set JAVA_HOME or JRE_HOME     ::
::::::::::::::::::::::::::::::::::::

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

goto NEXT

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

:ENDERROR
exit 1

:NEXT

echo [XAMPP]: Finding Java Version

set Cmd=reg query "%KeyName%" /v CurrentVersion
for /f "tokens=2*" %%i in ('%Cmd% ^| find "CurrentVersion"') do set CVERSION=%%j

echo [XAMPP]: Java Version: %CVERSION%
echo [XAMPP]: Starting Tomcat Service Install...
echo .

rem ----------END XAMPP-----------------------------------------------------------------

set "SELF=%~dp0%service.bat"
rem Guess CATALINA_HOME if not defined
set "CURRENT_DIR=%cd%"
if not "%CATALINA_HOME%" == "" goto gotHome
set "CATALINA_HOME=%cd%"
if exist "%CATALINA_HOME%\bin\tomcat7.exe" goto okHome
rem CD to the upper dir
cd ..
set "CATALINA_HOME=%cd%"
:gotHome
if exist "%CATALINA_HOME%\bin\tomcat7.exe" goto okHome
echo The tomcat.exe was not found...
echo The CATALINA_HOME environment variable is not defined correctly.
echo This environment variable is needed to run this program
goto end
:okHome
rem Make sure prerequisite environment variables are set
if not "%JAVA_HOME%" == "" goto gotJdkHome
if not "%JRE_HOME%" == "" goto gotJreHome
echo Neither the JAVA_HOME nor the JRE_HOME environment variable is defined
echo Service will try to guess them from the registry.
goto okJavaHome
:gotJreHome
if not exist "%JRE_HOME%\bin\java.exe" goto noJavaHome
if not exist "%JRE_HOME%\bin\javaw.exe" goto noJavaHome
goto okJavaHome
:gotJdkHome
if not exist "%JAVA_HOME%\jre\bin\java.exe" goto noJavaHome
if not exist "%JAVA_HOME%\jre\bin\javaw.exe" goto noJavaHome
if not exist "%JAVA_HOME%\bin\javac.exe" goto noJavaHome
if not "%JRE_HOME%" == "" goto okJavaHome
set "JRE_HOME=%JAVA_HOME%\jre"
goto okJavaHome
:noJavaHome
echo The JAVA_HOME environment variable is not defined correctly
echo This environment variable is needed to run this program
echo NB: JAVA_HOME should point to a JDK not a JRE
goto end
:okJavaHome
if not "%CATALINA_BASE%" == "" goto gotBase
set "CATALINA_BASE=%CATALINA_HOME%"
:gotBase

set "EXECUTABLE=%CATALINA_HOME%\bin\tomcat7.exe"

rem Set default Service name
set SERVICE_NAME=Tomcat7
set PR_DISPLAYNAME=Apache Tomcat 7

if "x%1x" == "xx" goto displayUsage
set SERVICE_CMD=%1
shift
if "x%1x" == "xx" goto checkServiceCmd
:checkUser
if "x%1x" == "x/userx" goto runAsUser
if "x%1x" == "x--userx" goto runAsUser
set SERVICE_NAME=%1
set PR_DISPLAYNAME=Apache Tomcat %1
shift
if "x%1x" == "xx" goto checkServiceCmd
goto checkUser
:runAsUser
shift
if "x%1x" == "xx" goto displayUsage
set SERVICE_USER=%1
shift
runas /env /savecred /user:%SERVICE_USER% "%COMSPEC% /K \"%SELF%\" %SERVICE_CMD% %SERVICE_NAME%"
goto end
:checkServiceCmd
if /i %SERVICE_CMD% == install goto doInstall
if /i %SERVICE_CMD% == remove goto doRemove
if /i %SERVICE_CMD% == uninstall goto doRemove
echo Unknown parameter "%1"
:displayUsage
echo.
echo Usage: service.bat install/remove [service_name] [/user username]
goto end

:doRemove
rem Remove the service
"%EXECUTABLE%" //DS//%SERVICE_NAME%
if not errorlevel 1 goto removed
echo Failed removing '%SERVICE_NAME%' service
goto end
:removed
echo The service '%SERVICE_NAME%' has been removed
goto end

:doInstall
rem Install the service
echo Installing the service '%SERVICE_NAME%' ...
echo Using CATALINA_HOME:    "%CATALINA_HOME%"
echo Using CATALINA_BASE:    "%CATALINA_BASE%"
echo Using JAVA_HOME:        "%JAVA_HOME%"
echo Using JRE_HOME:         "%JRE_HOME%"

rem Use the environment variables as an example
rem Each command line option is prefixed with PR_

set PR_DESCRIPTION=Apache Tomcat 7.0.22 Server - http://tomcat.apache.org/
set "PR_INSTALL=%EXECUTABLE%"
set "PR_LOGPATH=%CATALINA_BASE%\logs"
set "PR_CLASSPATH=%CATALINA_HOME%\bin\bootstrap.jar;%CATALINA_BASE%\bin\tomcat-juli.jar;%CATALINA_HOME%\bin\tomcat-juli.jar"
rem Set the server jvm from JAVA_HOME
set "PR_JVM=%JRE_HOME%\bin\server\jvm.dll"
if exist "%PR_JVM%" goto foundJvm
rem Set the client jvm from JAVA_HOME
set "PR_JVM=%JRE_HOME%\bin\client\jvm.dll"
if exist "%PR_JVM%" goto foundJvm
set PR_JVM=auto
:foundJvm
echo Using JVM:              "%PR_JVM%"
"%EXECUTABLE%" //IS//%SERVICE_NAME% --StartClass org.apache.catalina.startup.Bootstrap --StopClass org.apache.catalina.startup.Bootstrap --StartParams start --StopParams stop --Startup auto
if not errorlevel 1 goto installed
echo Failed installing '%SERVICE_NAME%' service
goto ENDERROR
:installed
rem Clear the environment variables. They are not needed any more.
set PR_DISPLAYNAME=
set PR_DESCRIPTION=
set PR_INSTALL=
set PR_LOGPATH=
set PR_CLASSPATH=
set PR_JVM=
rem Set extra parameters
"%EXECUTABLE%" //US//%SERVICE_NAME% --JvmOptions "-Dcatalina.base=%CATALINA_BASE%;-Dcatalina.home=%CATALINA_HOME%;-Djava.endorsed.dirs=%CATALINA_HOME%\endorsed" --StartMode jvm --StopMode jvm
rem More extra parameters
set "PR_LOGPATH=%CATALINA_BASE%\logs"
set PR_STDOUTPUT=auto
set PR_STDERROR=auto

rem XAMPP: We need special parameters for Java 7
if "%CVERSION%" == "1.7" goto JAVA7
:JAVA
"%EXECUTABLE%" //US//%SERVICE_NAME% ++JvmOptions "-Djava.io.tmpdir=%CATALINA_BASE%\temp;-Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager;-Djava.util.logging.config.file=%CATALINA_BASE%\conf\logging.properties" --JvmMs 128 --JvmMx 256
goto FINISH
:JAVA7
"%EXECUTABLE%" //US//%SERVICE_NAME% ++JvmOptions "-Djava.io.tmpdir=%CATALINA_BASE%\temp;-Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager;-Djava.util.logging.config.file=%CATALINA_BASE%\conf\logging.properties;-Djava.net.preferIPv4Stack=true" --JvmMs 128 --JvmMx 256
:FINISH
echo The service '%SERVICE_NAME%' has been installed.

:end
cd "%CURRENT_DIR%"

