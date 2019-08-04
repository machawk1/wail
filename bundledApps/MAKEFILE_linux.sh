#!/bin/bash

# This is the Makefile for WAIL for macOS
# http://matkelly.com/wail/

trap exit INT

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

if [ $1 == "ci" ]; then
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



installRequirements ()
{
  python3 -m pip install --upgrade wxPython
  python3 -m pip install -r requirements.txt
}

createBinary ()
{
  which pyinstaller
  pyinstaller -p bundledApps ./bundledApps/WAIL.py --onefile --windowed --clean --icon="./build/icons/wail_blue.icns"
}

cleanupByproducts ()
{
  # Remove installation remnants
  rm -r ./dist
  rm -r ./build/WAIL
}

installRequirements
createBinary
cleanupByproducts