#!/bin/bash
if [ -d "node_modules" ]; then
	echo "all good!"
else
	npm i jimp
fi
