# @aberoth-community/overheard
A simple "aberoth.com/overheard" scraper.

### Usage:
```javascript
import { Overheard } from '@aberoth-community/overheard'

const over = new Overheard({ interval: 1000 })
over
  .on('online', (state) => {})
  .on('moon', (state) => {})
  .on('scrolls', (state) => {})
```

### Command-line usage:
```bash
./overheard -i 1s -o print | xargs
```
