#!/bin/sh
./checkdeps.sh
sleep 1
node ./ocr.js keep2share.cc &> log.txt
sleep 2
