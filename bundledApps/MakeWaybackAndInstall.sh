#!/bin/bash

#set context
cd /Applications/WAIL/bundledApps/tomcat/webapps/wayback-src/wayback-master

#make
mvn validate /Applications/WAIL/tomcat/webapps/wayback-src/wayback-master
mvn compile
mvn package

#move
cp -r /Applications/WAIL/bundledApps/tomcat/webapps/wayback-src/wayback-master/wayback-webapp/target/wayback-1.7.1-SNAPSHOT /Applications/WAIL/tomcat/webapps/
rm -r /Applications/WAIL/bundledApps/tomcat/webapps/wayback-1.7.1-SNAPSHOT/WEB-INF
cp -r /Applications/WAIL/bundledApps/tomcat/webapps/wayback-1.6/WEB-INF /Applications/WAIL/tomcat/webapps/wayback-1.7.1-SNAPSHOT/WEB-INF
cp -r /Applications/WAIL/bundledApps/tomcat/webapps/ROOT/files1 /Applications/WAIL/tomcat/webapps/wayback-1.7.1-SNAPSHOT/


#install
mv /Applications/WAIL/bundledApps/tomcat/webapps/ROOT /Applications/WAIL/tomcat/webapps/ROOT_old
mv /Applications/WAIL/bundledApps/tomcat/webapps/wayback-1.7.1-SNAPSHOT/ /Applications/WAIL/tomcat/webapps/ROOT/