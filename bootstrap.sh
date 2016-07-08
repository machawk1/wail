#!/usr/bin/env bash

echo "running npm install"
npm "install"

echo "downloading the openjdk and memgator for current os"
npm run-script download-externals

if [ ! -z "$1" -a "$1" = "build"  ]; then
    if [ ! -z "$2" -a "$2" = "wextra"  ]; then
        echo "building for current os with extra info for osx"
        npm run-script package-wextra
    else
        echo "building for current os"
        npm run-script package
    fi
fi
