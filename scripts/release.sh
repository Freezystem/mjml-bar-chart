#!/bin/sh

npm config set git-tag-version true
npm config set sign-git-tag true

npm version $1 -m "Release %s"