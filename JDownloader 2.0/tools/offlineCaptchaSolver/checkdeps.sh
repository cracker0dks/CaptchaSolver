#!/bin/sh
if [ -d "node_modules" ]; then
	echo "all good!"
else
	npm ci
fi
