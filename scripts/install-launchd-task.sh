#!/bin/bash

# This script installs a scheduled task on macOS.

set -euo pipefail # Exit on errors and undefined variables.

# Get the directory of this script:
# https://stackoverflow.com/questions/59895/getting-the-source-directory-of-a-bash-script-from-within
DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

REPO_ROOT="$(dirname "$DIR")"
REPO_NAME="$(basename "$REPO_ROOT")"

# macOS convention uses reverse domain notation. (e.g. "com.user.project")
TASK_LABEL="local.$REPO_NAME.daily"

if launchctl list | grep -q "$TASK_LABEL"; then
  echo "Scheduled task \"$TASK_LABEL\" is already loaded. Exiting."
  exit
fi

EXECUTABLE_PATH="$REPO_ROOT/dist/$REPO_NAME"
if [[ ! -f "$EXECUTABLE_PATH" ]]; then
  echo "Error: The executable file was not found: $EXECUTABLE_PATH" >&2
  exit 1
fi
if [[ ! -x "$EXECUTABLE_PATH" ]]; then
  echo "Error: The executable file is not executable: $EXECUTABLE_PATH" >&2
  exit 1
fi

PLIST_PATH="$HOME/Library/LaunchAgents/$TASK_LABEL.plist"
echo "Creating plist file at: $PLIST_PATH"

cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$TASK_LABEL</string>

    <key>ProgramArguments</key>
    <array>
        <string>$EXECUTABLE_PATH</string>
    </array>

    <key>WorkingDirectory</key>
    <string>$REPO_ROOT</string>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>3</integer>
        <key>Minute</key>
        <integer>5</integer>
    </dict>

    <key>RunAtLoad</key>
    <false/>

    <key>StandardOutPath</key>
    <string>/tmp/${TASK_LABEL}.out.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/${TASK_LABEL}.err.log</string>
</dict>
</plist>
EOF

launchctl load "$PLIST_PATH"

echo "Successfully installed scheduled task: $TASK_LABEL"
echo "It will run daily at 3:05 AM."
