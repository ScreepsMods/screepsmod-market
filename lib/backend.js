module.exports = function (config) {
  if (config.backend) {
    config.cronjobs.recreateNpcOrders = [60, () => basicNPCOrders(config)]
  }
}

async function basicNPCOrders (config) {
  const { common: { storage: { db } }, market } = config

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
      if(market.priceMode === 'fixed') {
        buy.remainingAmount = market.buyAmount
        buy.totalAmount = market.buyAmount
        buy.amount = market.buyAmount
        buy.price = market.buyPrices[mineral]
      } else {
        buy.totalAmount = Math.floor(market.buyAmount * Math.random() * 2)
        buy.remainingAmount = Math.floor(buy.totalAmount * Math.random())
        buy.amount = Math.floor(buy.remainingAmount * Math.random())
        buy.price = Math.floor(market.buyPrices[mineral] * Math.random() * 2)
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
      if(market.priceMode === 'fixed') {
        sell.remainingAmount = market.sellAmount
        sell.totalAmount = market.sellAmount
        sell.amount = market.sellAmount
        sell.price = market.sellPrices[mineral]
      } else {
        sell.totalAmount = Math.floor(market.sellAmount * Math.random() * 2)
        sell.remainingAmount = Math.floor(sell.totalAmount * Math.random())
        sell.amount = Math.floor(sell.remainingAmount * Math.random())
        sell.price = Math.floor(market.sellPrices[mineral] * Math.random() * 2)
      }

      updates.push(sell)

    })
    updates.forEach(o => delete o._id)
    return updates.map(order => db['market.orders'].update({ type: order.type, roomName: order.roomName, resourceType: order.resourceType }, order, { upsert: true }))
  })
  return Promise.all(ps)
}
