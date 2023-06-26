# @aberoth-community/overheard

> ![CI](https://github.com/aberoth-community/overheard/actions/workflows/ci.yml/badge.svg)

A simple Aberoth ["Overheard"](https://aberoth.com/highscore/overheard.html) scraper library & cli.

## Installation:

1. Initialize your project

```bash
cd {project_dir} && npm init
```

2. Download the latest "\*.tgz" release - _[link](https://github.com/aberoth-community/overheard/releases/latest)_

3. Install the library

| client | ...                                                         |
| ------ | ----------------------------------------------------------- |
| npm    | `npm install ./aberoth-community-overheard-0.0.0.tgz`       |
| pnpm   | `pnpm install ./aberoth-community-overheard-0.0.0.tgz`      |
| yarn   | `yarn install file://aberoth-community-overheard-0.0.0.tgz` |

## Usage:

### Command-line:

> see: [Shell-Scripting](#shell-scripting)

```
$ ./overheard --help
Usage: overheard [options]

Options:
  -t, --time <time>  scan interval
  -q, --quiet        disable output (default: false)
  -v, --version      output the version number
  -h, --help         display help for command
```

### Example:

```javascript
import { OVERHEARD_SCHOOL_NAMES, Overheard } from '@aberoth-community/overheard'

// === Creating a new instance ===
const over = new Overheard(
  // Scraper options
  {
    time: 10e3,
    headers: {},
  },
  // Scraper cache
  {
    online: 50,
    moon: 'full',
    scrolls: {
      [OVERHEARD_SCHOOL_NAMES.RED]: 'dark',
    },
  },
)

// === Listening for events ===
over
  .on('error', console.log) // failed parse, invalid content "<html>504</html>"!
  .on('online', console.log) // 100
  .on('moon', console.log) // nearly_full
  .on('scrolls', console.log) // { name: 'necromancy', phase: 'normal' }
  // About to exit...
  .on('done', () => {
    // ...
  })
  // Start the scraper
  .start()
  // Stop the scraper
  .stop()

// ========= Getters =========
console.log(
  over.scrolls(), // [{ name, phase }, { name, phase }, ...]
  over.moon(), // nearly_full
  over.online(), // 100
)
```

### Shell-scripting:

> see: [scripts/sqlite.sh](scripts/sqlite.sh), [scripts/popen.py](scripts/popen.py)

```bash
./overheard -i 10s \
  | xargs -I {} bash -c 'command {}'
```
