#!/bin/bash
npx cap init
sed -i '' 's/webDir: '\''dist'\''/webDir: '\''build'\''/' capacitor.config.ts
npx cap add android
npx cap add ios
npx cap sync
./make-icons.sh
./update-app-icons.sh
