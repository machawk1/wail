#!/usr/bin/env bash

CWD=$(pwd)
export JAVA_HOME="${CWD}/openjdk"
export JRE_HOME="${CWD}/openjdk/jre"
export HERITRIX_HOME="${CWD}/heritrix"

START="${HERITRIX_HOME}/bin/heritrix"

$START -a lorem:ipsum --jobs-dir /home/john/Documents/WAIL_Managed_Crawls