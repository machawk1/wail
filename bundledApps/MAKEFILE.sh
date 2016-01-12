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

read -p "Would you like to install binary, create dmg, or both? (i/d/b) " ans

case "$ans" in
  i|d|b)
    ;;
  *)
    echo "Invalid choice, choose one of i/d/b"
    exit
    ;;
esac



createBinary ()
{
  pyinstaller ./bundledApps/WAIL.py --onefile --windowed --clean --icon="./build/icons/whale_1024.icns"
  # Replace default version and icon information from pyinstaller 
  cp ./build/Info.plist ./dist/WAIL.app/Contents/Info.plist
  # Copy the bundledApps and support directories to inside WAIL.app/
  cp -r ./bundledApps ./support ./build ./config ./archives ./archiveIndexes ./dist/WAIL.app/
  #pkgbuild --install-location=/Applications --component ./dist/WAIL.app ~/Downloads/WAIL.pkg
}

deleteBinary ()
{
  rm -rf /Applications/WAIL.app
}

mvProducts ()
{
  mv ./dist/WAIL.app /Applications/
  mv ./dist/WAIL /Applications/WAIL_cli
}

cleanupByproducts ()
{
  # Remove installation remnants
  rm -r ./dist
  rm -r ./build/WAIL
}

buildDiskImage ()
{
  # Create a dmg
  dmgbuild -s ./build/dmgbuild_settings.py "WAIL" WAIL.dmg
}

tweakOS ()
{
  # Instruct the system to update the version string
  defaults read /Applications/WAIL.app/Contents/Info.plist > /dev/null

  # Associate defined file types with WAIL
  /System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -f /Applications/WAIL.app
}

createBinary
deleteBinary # Remove previous version
mvProducts
cleanupByproducts

# install binary, create dmg, or both? (i/d/b) 

# Just build dmg, delete binary, no system tweaks required
if [ $ans = "b" ] || [ $ans = "d" ]; then
  buildDiskImage
  if [ $ans = "b" ]; then
    deleteBinary
  fi
fi

if [ $ans = "i" ] || [ $ans = "d" ]; then # Tweak system for binary
  tweakOS
fi
#killall Finder

#cleanup
#rm -r dist
#rm WAIL.spec
#rm -r build
