#!/bin/bash

while true; do
    deno run -A qc_questions.deno.ts
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        sleep 1
    else
        echo "Deno script exited with code $exit_code. Sleeping for 90 seconds before restarting..."
        sleep 90
    fi
done

