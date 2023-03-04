#!/usr/bin/env bash

insert() {
  if [[ "$2" == "scroll:" ]]; then
    echo "scroll! $3 $4"
    sqlite3 "$1" "INSERT INTO alerts (name, phase, date) VALUES ('$3', '$4', '$(date +%s)');"
  fi
}

export -f insert

sqlite3 "$1" 'CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY, name TEXT, phase TEXT, date INTEGER);'
node dist/index.js -t 10s | xargs -I {} bash -c "insert \"$1\" {}"
