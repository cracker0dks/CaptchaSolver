#!/bin/sh
cd "$(dirname "$0")" || exit 1

if [ -d "node_modules" ]; then
	echo "Dependencies are installed."
	exit 0
fi

echo "WARNING: node_modules directory is missing."
if command -v npm >/dev/null 2>&1; then
	echo "Attempting npm ci..."
	npm ci --production || npm install --production || {
		echo "ERROR: Failed to install npm dependencies." >&2
		exit 1
	}
else
	echo "ERROR: npm is not available in PATH and node_modules is missing." >&2
	echo "Please pre-install dependencies with 'npm ci' before running." >&2
	exit 1
fi
