module.exports = function (config) {
  if (config.backend) {
    config.cronjobs.recreateNpcOrders = [60, () => basicNPCOrders(config)]
  }
}

async function basicNPCOrders (config) {
  const { common: { storage: { db } }, market } = config
  market.randomVariance = market.randomVariance || 1
  let terminals = await db['rooms.objects'].find({ $and: [{ type: 'terminal' }, { user: { $eq: null } }] })
  let ps = terminals.map(async terminal => {
    let orders = await db['market.orders'].find({ roomName: terminal.room })
    orders = orders.reduce((l, v) => { l[v.type][v.resourceType] = v; return l }, { buy: {}, sell: {} })
    let updates = []
    Object.keys(market.buyPrices).forEach(mineral => {
      let buy = orders.buy[mineral]
      if (!buy) {
        buy = {
          created: 1,
          active: true,
          type: 'buy',
          amount: market.buyAmount,
          remainingAmount: market.buyAmount,
          totalAmount: market.buyAmount,
          resourceType: mineral,
          roomName: terminal.room
        }
      }
      if (market.priceMode === 'fixed') {
        buy.remainingAmount = market.buyAmount
        buy.totalAmount = market.buyAmount
        buy.amount = market.buyAmount
        buy.price = market.buyPrices[mineral]
      } else if (market.priceMode === 'random') {
        let amount = Math.floor(market.buyAmount * (Math.random() * market.randomVariance + (market.randomVariance/2)))
        buy.totalAmount = amount
        buy.remainingAmount = amount
        buy.amount = amount
        buy.price = market.buyPrices[mineral] * (Math.random() * market.randomVariance + (market.randomVariance/2))
      }

      updates.push(buy)
    })
    Object.keys(market.sellPrices).forEach(mineral => {
      let sell = orders.sell[mineral]
      if (!sell) {
        sell = {
          created: 1,
          active: true,
          type: 'sell',
          amount: market.sellAmount,
          remainingAmount: market.sellAmount,
          totalAmount: market.sellAmount,
          resourceType: mineral,
          roomName: terminal.room
        }
      }
      if (market.priceMode === 'fixed') {
        sell.remainingAmount = market.sellAmount
        sell.totalAmount = market.sellAmount
        sell.amount = market.sellAmount
        sell.price = market.sellPrices[mineral]
      } else if (market.priceMode === 'random') {
        let amount = Math.floor(market.buyAmount * (Math.random() * market.randomVariance + (market.randomVariance/2)))
        sell.totalAmount = amount
        sell.remainingAmount = amount
        sell.amount = amount
        sell.price = market.sellPrices[mineral] * (Math.random() * market.randomVariance + (market.randomVariance/2))
      }

      updates.push(sell)
    })
    updates.forEach(o => delete o._id)
    return updates.map(order => db['market.orders'].update({ type: order.type, roomName: order.roomName, resourceType: order.resourceType }, order, { upsert: true }))
  })
  return Promise.all(ps)
}
