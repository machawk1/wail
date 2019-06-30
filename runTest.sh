#!/usr/bin/env bash

here=$(pwd)
testDir=${here}/tests
ava="node --harmony --harmony_async_await ./node_modules/.bin/ava --verbose"

${ava} ${testDir}/$1