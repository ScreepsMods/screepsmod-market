# screepsmod-market

## Screeps Private Server Alternate NPC Market code

[![NPM info](https://nodei.co/npm/screepsmod-market.png?downloads=true)](https://npmjs.org/package/screepsmod-market)

[![Circle CI](https://circleci.com/gh/ScreepsMods/screepsmod-market.svg?style=shield)](https://circleci.com/gh/ScreepsMods/screepsmod-market)

# Installation 

1. `npm install screepsmod-market` in your mods folder.
2. Thats it!

# Config
Config is done via `market.yml` in your screeps directory

```yaml
# modes are for potential future use
# priceMode can be 'fixed' for fixed values or 'random' for random prices and volumes with the given values as average
priceMode: 'fixed'
sellMode: 'always'
buyMode: 'always'
sellPrices:
  H: 3000
  O: 3000
  Z: 6000
  K: 6000
  U: 6000
  L: 6000
  X: 18000
buyPrices:
  H: 10
  O: 10
  Z: 10
  K: 10
  U: 10
  L: 10
  X: 10
sellMineralAmount: 1000000
buyMineralAmount: 1000000
```

