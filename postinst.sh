#!/bin/sh
set -e

# Set permissions for chrome-sandbox
if [ -f /opt/PostWoman/chrome-sandbox ]; then
    chown root:root /opt/PostWoman/chrome-sandbox
    chmod 4755 /opt/PostWoman/chrome-sandbox
fi