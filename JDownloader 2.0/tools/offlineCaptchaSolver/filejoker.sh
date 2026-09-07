#!/bin/sh
cd "$(dirname "$0")" || exit 1

./checkdeps.sh || exit 1

file="result.txt"
[ -e "$file" ] && rm -f "$file"

# Run solver in background and track PID
node ./ocr.js filejoker.net > solver.log 2>&1 &
node_pid=$!

# Wait up to 30s with subsecond polling (0.1s)
timeout_tenths=300
elapsed_tenths=0

while [ ! -e "$file" ] && [ "$elapsed_tenths" -lt "$timeout_tenths" ]; do
    if ! kill -0 "$node_pid" 2>/dev/null; then
        # Node process exited
        break
    fi
    sleep 0.1
    elapsed_tenths=$((elapsed_tenths + 1))
done

if [ ! -e "$file" ]; then
    kill -9 "$node_pid" 2>/dev/null
    echo "ERROR: Captcha solver failed or timed out" >> solver.log
    exit 1
fi


exit 0