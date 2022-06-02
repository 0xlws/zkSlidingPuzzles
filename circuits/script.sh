#! /bin/bash

# cd $1 
tsc $1/scripts/index --outDir $1/scripts/build/ && node $1/scripts/build/ .



