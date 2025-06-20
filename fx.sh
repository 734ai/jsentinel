#!/bin/bash

# ------------------------------------------------------------------------------
# Defaults:
# ------------------------------------------------------------------------------

ADD_ON_DIR=./firefox
NODE_JSENTINEL_FILE=./node/lib/jsentinel.js
FX_JSENTINEL_FILE=$ADD_ON_DIR/lib/jsentinel.js
FX_PROFILE_DIR=""
FX_PATH=""
target=$1
release=false

# ------------------------------------------------------------------------------
# check if the jpm tool exist
# ------------------------------------------------------------------------------

if ! type jpm > /dev/null; then
  echo "Aborting jpm command not found"
  exit 1
fi

# ------------------------------------------------------------------------------
# puts out the help text
# ------------------------------------------------------------------------------

function howToUse {
  echo "Usage: $0 target [target-specific options]"
  echo
  echo "Targets:"
  echo "  test    - run the tests"
  echo "  run     - run the add-on in a browser"
  echo "  build   - exports the xpi"
  echo
  echo "Options:"
  echo "  -p PROFILEDIR"
  echo "     Use an existing profile located in PROFILEDIR. If the PROFILEDIR does not exist it will be automatically created."
  echo "     Example:"
  echo "     ./fx.sh run -p ~/firefox-jsentinel-profile"
  echo
  echo "  -release"
  echo "     Creates a release. Does not append a timestamp to the filename."
  echo
  exit 1
}

# ------------------------------------------------------------------------------
# create the firfox/lib/jsentinel.js file based on the node/lib/jsentinel.js
# ------------------------------------------------------------------------------

function createJSentinel {
  if (grep -Fxq "var exports = exports || {};" $NODE_JSENTINEL_FILE); then
    cat $NODE_JSENTINEL_FILE > $FX_JSENTINEL_FILE
    sed -i.bak s/"var exports = exports || {};"/"if (typeof exports != \"object\") exports = {};"/g $FX_JSENTINEL_FILE
    rm $FX_JSENTINEL_FILE."bak"
  else
    echo "Exit. Could not create $FX_JSENTINEL_FILE"
    exit 1
  fi
}

# ------------------------------------------------------------------------------
# parsing command line parameters
# ------------------------------------------------------------------------------

while [ "$2" != "" ]; 
do
  case $2 in
    -p | --profiledir ) 
      shift
      FX_PROFILE_DIR=$2
      ;;
    -b | --binarypath )
      shift
      FX_PATH=$2
      ;;
    -release ) 
      shift
      release=true
      ;;
  esac
  shift
done

# ------------------------------------------------------------------------------
# runs the tests
# ------------------------------------------------------------------------------

function runTests {
  jpm test
}

# ------------------------------------------------------------------------------
# runs the add-on in the browser
# ------------------------------------------------------------------------------

function runBrowser {
  PROG_ARG=""
  if ! [ -z $FX_PROFILE_DIR ] 
  then
    PROG_ARG="$PROG_ARG -p $FX_PROFILE_DIR "
  fi
  #jpm run -p $FX_PROFILE_DIR 
  if ! [ -z $FX_PATH ]
  then
    PROG_ARG="$PROG_ARG -b $FX_PATH"
    echo $PROG_ARG
  fi
  echo $PROG_ARG
  echo "jpm run @@$PROG_ARG@@"
  jpm run $PROG_ARG
  echo $PROG_ARG
}

# ------------------------------------------------------------------------------
# creates an xpi
# ------------------------------------------------------------------------------

function build {
  addonName=$(sed -n 's/.*"name": "\(.*\)",/\1/p' package.json)
  version=$(sed -n 's/.*"version": "\(.*\)",/\1/p' package.json)
  now=$(date +"%Y%m%d%H%M%S")
  if $release;
    then
      filename="${addonName}-${version}.xpi"
    else
      filename="${addonName}-${version}_${now}.xpi"
  fi
  jpm xpi
  mv $addonName.xpi $filename
  echo "Add-on built: $filename"
}

# ------------------------------------------------------------------------------
# prepearing
# ------------------------------------------------------------------------------

createJSentinel

cd $ADD_ON_DIR
case "$target" in
  "test")
    runTests
    ;;
  "run")
    runBrowser
    ;;
  "build")
    build
    ;;
  "-help")
    howToUse
    ;;
  *)
    echo
    echo "$0: Target not supported (yet): $target"
    echo
    howToUse
    exit 1
    ;;
esac  
  
