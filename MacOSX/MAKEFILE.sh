#!/bin/bash

#This is the Makefile for WAIL for MacOS X

cd /Applications/WAIL

# You need python to execute it

if [ ! -z "$1" -a "$1" = "clean"  ]; then
  if [ -e tomcat/webapps/ROOT/file-db ]; then 
    rm -r tomcat/webapps/ROOT/file-db
  fi
  if [ -e tomcat/webapps/ROOT/index ]; then 
   rm -r tomcat/webapps/ROOT/index
  fi
  if [ -e tomcat/webapps/ROOT/index-data ]; then 
   rm -r tomcat/webapps/ROOT/index-data
  fi
  rm -r heritrix-3.1.2/jobs/* 
  rm tomcat/webapps/ROOT/files1/*
fi

arch -i386 python pyinstaller-2.0/pyinstaller.py WAIL.py --onefile --windowed

todaysVersion=$(date "+0.%Y.%m.%d")
# OS X (& other BSDs) requires an empty string after the -i flag so it doesn't invoke unix "d" command
sed -i "" "s/0.0.0/$todaysVersion by Mat Kelly/g" "dist/WAIL.app/Contents/Info.plist"


#remove stale .app
rm -r WAIL.app

#move app to WAIL root
mv ./dist/WAIL.app ./
sleep 3

#cleanup
rm -r dist
rm WAIL.spec
rm -r build

