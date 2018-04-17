module.exports = function (config) {
  if (config.backend) {
    config.cronjobs.recreateNPCOrders = [60, () => basicNPCOrders(config)]
  }
}

async function basicNPCOrders (config) {
  const { common: { storage: { db, env } }, market } = config

  let terminals = await db['rooms.objects'].find({ $and: [{ type: 'terminal' }, { user: { $eq: null } }] })
  let ps = terminals.map(async terminal => {
    let orders = await db['market.orders'].find({ roomName: terminal.room })
    orders = orders.reduce((l, v) => { l[v.type][v.resourceType] = v; return l }, { buy: {}, sell: {} })
    let updates = []
    Object.keys(market.buyPrices).forEach(mineral => {
      let buy = orders.buy[mineral]
      let sell = orders.sell[mineral]
      if (!buy) {
        buy = {
          created: 1,
          active: true,
          type: 'buy',
          amount: market.buyMineralAmount,
          remainingAmount: market.buyMineralAmount,
          totalAmount: market.buyMineralAmount,
          resourceType: mineral,
          roomName: terminal.room
        }
      }
      buy.remainingAmount = market.buyMineralAmount
      buy.totalAmount = market.buyMineralAmount
      buy.amount = market.buyMineralAmount
      buy.price = market.buyPrices[mineral]

      updates.push(buy)
    })
    Object.keys(market.sellPrices).forEach(mineral => {
      if (!sell) {
        sell = {
          created: 1,
          active: true,
          type: 'sell',
          amount: market.sellMineralAmount,
          remainingAmount: market.sellMineralAmount,
          totalAmount: market.sellMineralAmount,
          resourceType: mineral,
          roomName: terminal.room
        }
      }
      sell.remainingAmount = market.sellMineralAmount
      sell.totalAmount = market.sellMineralAmount
      sell.amount = market.sellMineralAmount
      sell.price = market.sellPrices[mineral]
      updates.push(sell)
    })
    updates.forEach(o => delete o._id)
    return updates.map(order => db['market.orders'].update({ type: order.type, roomName: order.roomName, resourceType: order.resourceType }, order, { upsert: true }))
  })
  return Promise.all(ps)
}
