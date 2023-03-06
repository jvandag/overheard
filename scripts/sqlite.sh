#!/usr/bin/env bash

FILEPATH="$1"
POLL_SECONDS="30"

insert() {
  local time="$(date +"%d/%m/%Y-%T")"
  case "$1" in
    "online:" )
      echo "$time online $2 $3"
      sqlite3 "$FILEPATH" \
        "INSERT INTO online (count, date) VALUES ('$2', '$time');"
      ;;
    "scroll:" )
      echo "$time scroll $2 $3"
      sqlite3 "$FILEPATH" \
        "INSERT INTO alerts (name, phase, date) VALUES ('$2', '$3', '$time');"
    ;;
  esac
}

listen() {
  node dist/index.js -t "${POLL_SECONDS}s" | xargs -I {} bash -c 'insert {}'
}

export -f insert
export FILEPATH

# Main
[[ "${FILEPATH##*.}" != "sqlite" ]] \
  && echo "Error: path \"$FILEPATH\" is invalid!" >&2 \
  && exit 1

# Create tables
sqlite3 "$FILEPATH" <<EOF
CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY, name TEXT, phase TEXT, date TEXT);
CREATE TABLE IF NOT EXISTS online (id INTEGER PRIMARY KEY, count INTEGER, date TEXT);
EOF

# Start listener
until listen; do
  echo "Scraper crashed with code $? restarting..." >&2 \
    && sleep "$POLL_SECONDS"
done
