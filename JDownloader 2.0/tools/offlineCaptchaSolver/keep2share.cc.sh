#!/bin/sh
./checkdeps.sh

file="result.txt"
[ -e "$file" ] && rm "$file"
sleep 1

node ./ocr.js keep2share.cc &> log.txt

while [ ! -e "$file" ]; do
    sleep 1
done

sleep 1