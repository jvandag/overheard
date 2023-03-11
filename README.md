# @aberoth-community/overheard
A simple Aberoth ["Overheard"](https://aberoth.com/highscore/overheard.html) scraper.

### Usage:
```javascript
import { Overheard } from '@aberoth-community/overheard'

// Create a new scrapper w/ a poll rate of 10s
const over = new Overheard({ time: 10e3 })
over
  .on('online', ([newOnline, oldOnline]) => {
    console.log(newOnline) // 75
    console.log(oldOnline) // null, or last stored
  })
  .on('moon', (phase) => {
    console.log(phase) // "nearly_full" - see types/events
  })
  .on('scrolls', (scrolls) => {
    console.log(scrolls) // [{ name: 'enchantment', phase: 'dark' }, ...]
  })
```

### Command-line usage:
```bash
./overheard -i 10s | xargs -I {} \
  bash -c 'my-command {}'
```
