#!/usr/bin/env bash

insert() {
  local time="$(date +"%d/%m/%Y-%T")"
  local date="$(date +%s)"
  if [[ "$2" == "online:" ]]; then
    echo "$time online $3"
    sqlite3 "$1" "INSERT INTO online (count, date) VALUES ('$3', '$date');"
  fi
  if [[ "$2" == "scroll:" ]]; then
    echo "$time scroll $3 $4"
    sqlite3 "$1" "INSERT INTO alerts (name, phase, date) VALUES ('$3', '$4', '$date');"
  fi
}

export -f insert

sqlite3 "$1" <<EOF
CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY, name TEXT, phase TEXT, date INTEGER);
CREATE TABLE IF NOT EXISTS online (id INTEGER PRIMARY KEY, count INTEGER, date INTEGER);
EOF
node dist/index.js -t 10s | xargs -I {} bash -c "insert \"$1\" {}"
