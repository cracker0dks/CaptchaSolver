#!/bin/sh
./checkdeps.sh
sleep 1
node ./ocr.js filejoker.net &> log.txt
sleep 1
