#!/usr/bin/env bash

cwd=$(pwd)
release="$cwd/release/*"

echo "running npm install"
npm install

echo "downloading the openjdk and memgator for current os"
npm run-script download-externals

if [ ! -z "$1" -a "$1" = "build"  ]; then
    rm -rf ${release}
    echo "building for current os"
    npm run-script package
fi
