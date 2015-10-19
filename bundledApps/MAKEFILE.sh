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


#pyVersion=$(python -c 'import sys; print(sys.version_info[:])')

DIRECTORY="/Applications/WAIL.app/"

# Check if WAIL.app exists. Ask the user whether to nuke old binary. Exit if 'no'
if [ -d "$DIRECTORY" ]; then
  echo $DIRECTORY" already exists!"
  while true; do
    read -p "Do you want me to delete the old app and continue (y/n)?" yn
    case $yn in
        [Yy]* ) echo "Continuing to build"; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y or n.";;
    esac
  done
fi


#arch -i386 python ../build/pyinstaller-2.0/pyinstaller.py WAIL.py --onefile --windowed
# Above no longer works on OS X>10.8.5 though it might be a homebrew vs. Apple python issue.
pyinstaller ./bundledApps/WAIL.py --onefile --windowed --clean --icon="./build/icons/whale_1024.icns" #--distpath="/Applications"

cp ./build/Info.plist ./dist/WAIL.app/Contents/Info.plist

todaysVersion="1.0" #$(date "+0.%Y.%m.%d") #This is bad practice, as the source code specifies a version internally, too. Unify this to one src. Until then, duct tape!
# OS X (& other BSDs) requires an empty string after the -i flag so it doesn't invoke unix "d" command
sed -i "" "s/0.0.0/$todaysVersion by Radon/g" "./dist/WAIL.app/Contents/Info.plist"

# Copy the bundledApps and support directories to inside WAIL.app/
cp -r ./bundledApps ./support ./build ./dist/WAIL.app/

rm -rf /Applications/WAIL.app
mv ./dist/WAIL.app /Applications/
mv ./dist/WAIL /Applications/WAILX

#remove installation remnants
rm -r ./dist
rm -r ./build/WAIL

defaults read /Applications/WAIL.app/Contents/Info.plist > /dev/null

#cleanup
#rm -r dist
#rm WAIL.spec
#rm -r build
