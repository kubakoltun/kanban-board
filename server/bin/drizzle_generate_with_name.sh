#!/bin/sh

if [ -z "$1" ]; then
    echo "Podaj nazwę migracji"
    exit 1
fi

drizzle-kit generate --name "$1"
