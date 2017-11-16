#!/bin/bash

# This is the Makefile for WAIL for macOS
# http://matkelly.com/wail/

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

read -p "Would you like to install binary (i), create dmg (d), or both (b)? (i/d/b) " ans

case "$ans" in
  i|d|b)
    ;;
  *)
    echo "Invalid choice, choose one of i/d/b"
    exit
    ;;
esac



installRequirements ()
{
  #pip install --upgrade --trusted-host wxpython.org --pre -f http://wxpython.org/Phoenix/snapshot-builds/ wxPython_Phoenix
  pip install --upgrade wxPython
  pip install -r requirements.txt
}

createBinary ()
{
  pyinstaller ./bundledApps/WAIL.py --onefile --windowed --clean --icon="./build/icons/wail_blue.icns"
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

installRequirements
createBinary
deleteBinary # Remove previous version
mvProducts
cleanupByproducts

# install binary, create dmg, or both? (i/d/b) 

# Just build dmg, delete binary, no system tweaks required
if [ $ans = "b" ] || [ $ans = "d" ]; then
  buildDiskImage
  if [ $ans = "d" ]; then # Remove the installed binary if only making dmg
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
