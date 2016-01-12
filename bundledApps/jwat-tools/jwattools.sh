#!/bin/sh
ProgDir=`dirname "$0"`
. "${ProgDir}/env.sh"

if [ -z "${JAVA_OPTS}" ]; then
  # -XX:PermSize=64M -XX:MaxPermSize=256M
  JAVA_OPTS="-Xms256m -Xmx1024m"
fi

"${JAVA}" ${JAVA_OPTS} -cp "$CP" org.jwat.tools.JWATTools "$@"
