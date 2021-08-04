#!/bin/bash

# This is the Makefile for WAIL for macOS
# http://matkelly.com/wail/

DIRECTORY="/Applications/WAIL.app/"

trap exit INT

main ()
{
  # Provide a means to skip all questions for GitHub Actions
  while getopts ":q" opt; do
    case ${opt} in
    q )
      echo "Skipping options to build for testing" >&2
      makeWAIL
      exit 0
      ;;
    \? )
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    esac
  done


  # Check if WAIL processes are running and offer to kill them
  wailProcessesRunning=$(ps -A | grep '[/]WAIL.app/' | wc -l)
  if (($wailProcessesRunning > 0)); then
    while true; do
      read -p "Kill currently running WAIL processes (y/n)? " yn
      case $yn in
          [Yy]* )
              pkill -f '[/]WAIL.app/'
              break;;
          [Nn]* )
              break;;
          * ) echo "Please answer y or n.";;
      esac
    done
  fi

  # Check if WAIL.app exists. Ask the user whether to nuke old binary. Exit if 'no'
  if [ -d "$DIRECTORY" ]; then
    echo $DIRECTORY" already exists!"
    while true; do
      read -p "Do you want me to delete the old app and continue (y/n)? " yn
      case $yn in
          [Yy]* ) echo "Continuing to build, retaining WARCs"; break;;
          [Nn]* ) exit;;
          * ) echo "Please answer y or n.";;
      esac
    done
  fi

  if [[ $1 == "ci" ]]; then
   ans="i"
  else
   read -p "Would you like to install binary (i), create dmg (d), or both (b)? (i/d/b) " ans
  fi


  case "$ans" in
    i|d|b)
      ;;
    *)
      echo "Invalid choice, choose one of i/d/b"
      exit
      ;;
  esac

  makeWAIL
}

# For Apple Silicon support, see #494
buildPyinstallerBootloaders ()
{
  echo "Building bootloader for Apple Silicon"
  git clone https://github.com/pyinstaller/pyinstaller.git
  cd pyinstaller/bootloader
  python3 ./waf all
  cd ..
  python3 -m pip install .
  cd ..
}

installRequirements ()
{
  echo "Installing build requirements"
  python3 -m pip install --upgrade wxPython
  python3 -m pip install -r requirements.txt
  if [[ $(uname -p) == 'arm' ]]; then
    buildPyinstallerBootloaders
  fi
}

createBinary ()
{
  echo "Creating binary"
  which pyinstaller
  pyinstaller -p bundledApps ./bundledApps/WAIL.py --onefile --windowed --clean --icon="./build/icons/wail_blue.icns"
  # Replace default version and icon information from pyinstaller 
  cp ./build/Info.plist ./dist/WAIL.app/Contents/Info.plist
  # Copy the bundledApps and support directories to inside WAIL.app/
  cp -r ./bundledApps ./support ./build ./config ./archives ./archiveIndexes ./dist/WAIL.app/
  #pkgbuild --install-location=/Applications --component ./dist/WAIL.app ~/Downloads/WAIL.pkg
}

deleteBinary ()
{
  echo "Deleting binary"
  rm -rf /Applications/WAIL.app
}

mvWARCsToTemp ()
{
  if [ -d "/tmp/tempArchives" ]
  then
    echo "Moving WARCs to /tmp/tempArchives/"
    mv /tmp/tempArchives /tmp/tempArchives_old
    mv /Applications/WAIL.app/archives /tmp/tempArchives
  fi
}

mvWARCsBackFromTemp ()
{
  if [ -d "/tmp/tempArchives" ]
  then
    echo "Moving WARCs back to /Applications/WAIL.app/archives/"
    mv /tmp/tempArchives/* /Applications/WAIL.app/archives/
    rm -rf /tmp/tempArchives
    mv /tmp/tempArchives_old /tmp/tempArchives
  fi
}

mvProducts ()
{
  echo "Moving WAIL.app to /Applications"
  mv ./dist/WAIL.app /Applications/
  mv ./dist/WAIL /Applications/WAIL_cli
}

cleanupByproducts ()
{
  echo "Cleaning up byproducts, deleting ./dist and ./build/WAIL"
  # Remove installation remnants
  rm -r ./dist
  rm -r ./build/WAIL
}

optimizeforMac ()
{
  echo "Optimizing for Mac"
  # Remove Windows supporting package
  echo "> Removing MemGator (Linux)"
  rm ./dist/WAIL.app/bundledApps/memgator-linux-amd64
  echo "> Removing MemGator (Window)"
  rm ./dist/WAIL.app/bundledApps/memgator-windows-amd64.exe
  echo "> Removing Java (Windows)"
  rm -rf ./dist/WAIL.app/bundledApps/Java/Windows
  if [[ $(uname -p) == 'i386' ]]; then
    echo "> Removing MemGator (Apple Silicon)"
    rm ./dist/WAIL.app/bundledApps/memgator-darwin-arm64
    chmod 755 ./dist/WAIL.app/bundledApps/memgator-darwin-amd64
  else
    echo "> Removing MemGator (pre-Apple Silicon)"
    rm ./dist/WAIL.app/bundledApps/memgator-darwin-amd64
    chmod 755 ./dist/WAIL.app/bundledApps/memgator-darwin-arm64
  fi
}

buildDiskImage ()
{
  echo "Building Disk Image"
  # Create a dmg
  dmgbuild -s ./build/dmgbuild_settings.py "WAIL" WAIL.dmg
}

tweakOS ()
{
  echo "Tweaking OS file associations"
  # Instruct the system to update the version string
  defaults read /Applications/WAIL.app/Contents/Info.plist > /dev/null

  # Associate defined file types with WAIL
  /System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -f /Applications/WAIL.app
}

makeWAIL ()
{
  echo "Running makeWAIL()"
  installRequirements
  createBinary
  mvWARCsToTemp
  deleteBinary # Remove previous version
  optimizeforMac
  mvProducts
  cleanupByproducts
  mvWARCsBackFromTemp

  # install binary, create dmg, or both? (i/d/b)

  # Just build dmg, delete binary, no system tweaks required
  if [[ $ans == "b" ]] || [[ $ans == "d" ]]; then
    buildDiskImage
    if [[ $ans = "d" ]]; then # Remove the installed binary if only making dmg
      deleteBinary
    fi
  fi

  if [[ $ans = "i" ]] || [[ $ans = "d" ]]; then # Tweak system for binary
    tweakOS
  fi
  #killall Finder

  #cleanup
  #rm -r dist
  #rm WAIL.spec
  #rm -r build
}

main "$@"; exit
