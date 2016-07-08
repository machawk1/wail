#!/usr/bin/env bash

base=$(pwd)

bs="$base/bootstrap.sh"

if [ ! -x "$bs" ]; then
     chmod +x "$bs"
fi

if [ ! -z "$1" -a "$1" = "start-dev"  ]; then
    echo start dev
    npm "run-script start-dev"
elif [ ! -z "$1" -a "$1" = "package" ]; then
    echo "building and packaging for the current os"
     npm "run-script package"
elif [ ! -z "$1" -a "$1" = "package-all" ]; then
   echo "building and packaging for all supported platforms"
   npm "run-script package-all"
elif [ ! -z "$1" -a "$1" = "install" ]; then
    npm "install"
elif [ ! -z "$1" -a "$1" = "install-start" ]; then
    echo "npm install && npm run-script start-dev"
    npm "install"
    npm "run-script start-dev"
elif [ ! -z "$1" -a "$1" = "run-release-linux" ]; then
    $(release/linux-x64/Wail-linux-x64/Wail)
elif [! -z "$1" -a "$1" = "bootstrap"]; then
     echo running bootstrap.sh
     $bs
elif [! -z "$1" -a "$1" = "bootstrap-build"]; then
     echo running bootstrap.sh
     $bs "build"
fi