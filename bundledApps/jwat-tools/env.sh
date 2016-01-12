# If JAVA_HOME is not set, use the java in the execution path
if [ ${JAVA_HOME} ] ; then
  JAVA="$JAVA_HOME/bin/java"
else
  JAVA=java
fi

# JWATTOOLS_HOME must point to home directory of JWAT-Tools install.
PRG="$0"

# need this for relative symlinks
while [ -h "$PRG" ] ; do
    ls=`ls -ld "$PRG"`
    link=`expr "$ls" : '.*-> \(.*\)$'`
    if expr "$link" : '/.*' > /dev/null; then
      PRG="$link"
    else
      PRG="`dirname "$PRG"`/$link"
    fi
done

JWATTOOLS_HOME=`dirname "$PRG"`

# make it fully qualified
JWATTOOLS_HOME=`cd "$JWATTOOLS_HOME" && pwd`

# CP must contain a colon-separated list of resources used by JWAT-Tools.
CP=$JWATTOOLS_HOME/
for i in `ls ${JWATTOOLS_HOME}/lib/*.jar`
do
  CP=${CP}:${i}
done
#echo $CP
