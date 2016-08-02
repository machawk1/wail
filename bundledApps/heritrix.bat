@echo off 
set here=%cd%
set JAVA_HOME=%here%\openjdk
set JRE_HOME=%here%\openjdk\jre
set HERITRIX_HOME=%here%\heritrix-3.3.0
set start=%here%\heritrix-3.3.0\bin\heritrix.cmd


echo starting  %*

%start% %*