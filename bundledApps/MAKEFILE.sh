#!/bin/bash

# This is the Makefile for WAIL for MacOS X
# http://matkelly.com/wail/

#cd /Applications/WAIL

# You need python to execute it

#if [ ! -z "$1" -a "$1" = "clean"  ]; then
#  if [ -e tomcat/webapps/ROOT/file-db ]; then 
#    rm -r tomcat/webapps/ROOT/file-db
#  fi
#  if [ -e tomcat/webapps/ROOT/index ]; then 
#   rm -r tomcat/webapps/ROOT/index
#  fi
#  if [ -e tomcat/webapps/ROOT/index-data ]; then 
#   rm -r tomcat/webapps/ROOT/index-data
#  fi
#  rm -r heritrix-3.2.0/jobs/* 
#  rm tomcat/webapps/ROOT/files1/*
#fi

#arch -i386 python ../build/pyinstaller-2.0/pyinstaller.py WAIL.py --onefile --windowed
# Above no longer works on OS X>10.8.5 though it might be a homebrew vs. Apple python issue.
python ./build/pyinstaller-2.1/pyinstaller.py ./bundledApps/WAIL.py --onefile --windowed --clean --icon="./build/icons/whale_1024.icns" #--distpath="/Applications"

todaysVersion=$(date "+0.%Y.%m.%d")
# OS X (& other BSDs) requires an empty string after the -i flag so it doesn't invoke unix "d" command
sed -i "" "s/0.0.0/$todaysVersion by Mat Kelly/g" "./dist/WAIL.app/Contents/Info.plist"

# Copy the bundledApps and support directories to inside WAIL.app/
cp -r ./bundledApps ./support ./build ./dist/WAIL.app/
mv ./dist/WAIL.app /Applications/
mv ./dist/WAIL /Applications/WAILX

#remove installation remnants
rm -r ./dist

#cleanup
#rm -r dist
#rm WAIL.spec
#rm -r build

