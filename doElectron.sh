#!/usr/bin/env bash

base=$(pwd)

bs="$base/bootstrap.sh"

if [ ! -x "$bs" ]; then
     chmod +x "$bs"
fi

if [ ! -z "$1" ]; then
    echo $1
    if [ "$1" = "install-start" ]; then
        echo "npm install && npm run-script start-dev"
        npm "install"
        npm "run-script start-dev" &
    elif [ "$1" = "bootstrap" ]; then
         echo running bootstrap.sh
         $bs
    elif [ "$1" = "bootstrap-build" ]; then
         echo running bootstrap.sh
         $bs "build"
    else
        echo "npm run-script $1"
        npm run-script $1 &
    fi
fi
