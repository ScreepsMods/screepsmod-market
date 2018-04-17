const YAML = require('yamljs')
const fs = require('fs')

const DEFAULT = {
  priceMode: 'fixed',
  sellMode: 'always',
  buyMode: 'always',
  sellPrices: {
    H: 3000,
    O: 3000,
    Z: 6000,
    K: 6000,
    U: 6000,
    L: 6000,
    X: 18000
  },
  buyPrices: {
    H: 10
    O: 10
    Z: 10
    K: 10
    U: 10
    L: 10
    X: 10
  },
  sellMineralAmount: 1000000,
  buyMineralAmount: 1000000
}

module.exports = function (config) {
  config.market = Object.assign({}, DEFAULT)
  try {
    const data = fs.readFileSync('market.yml', 'utf8')
    const parsed = YAML.parse(data)
    Object.assign(config.market, parsed)
  } catch (e) {}
}
