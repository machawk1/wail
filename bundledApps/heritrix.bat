@echo off 
set here=%cd%
set JAVA_HOME=%here%\openjdk
set JRE_HOME=%here%\openjdk\jre
set HERITRIX_HOME=%here%\heritrix
set start=%here%\heritrix\bin\heritrix.cmd


echo starting  %*

%start% %*