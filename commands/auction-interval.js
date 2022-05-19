const getAuctionTotalsEmbed = require('../utility/get-auction-totals-embed')
let intervalChannelMap = new Map()

async function postAuctionTotals(channel) {
	try {
		const embed = await getAuctionTotalsEmbed() //we always do current auction for the interval command
		return await channel.send({ embed })
	} catch (err) {
		console.error(err.message)
		return await channel.send(`Error getting auction totals`)
	}
}

async function enableInterval(minutes, channel, customMessage = '') {
	const delay = minutes * 60000
	const intervalId = setInterval(postAuctionTotals, delay, channel)

	intervalChannelMap.set(channel.id, intervalId)
	await channel.send(customMessage || `Posting auction info every ${minutes} minutes. (!auctionint) to cancel.`)
	await postAuctionTotals(channel)
}

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	let minutes = parseInt(args[0], 10)
		const userDidGiveMinutes = !!(args[0])

		if (isNaN(minutes) || minutes < 1 || minutes > 120) {
			minutes = 30
		}

		if (intervalChannelMap.has(message.channel.id)) {
			const intervalId = intervalChannelMap.get(message.channel.id)
			clearInterval(intervalId)
			intervalChannelMap.delete(message.channel.id)

			if (userDidGiveMinutes) {
				//If the user gave us minutes when the channel already has an interval set
				//we should just enable a new interval with the minutes they gave us.
				enableInterval(minutes, message.channel, `Posting interval changed to every ${minutes} minutes`)
					.catch(err => console.log('Error enabling auction posting interval', err))
			} else {
				message.channel.send('Auction posting stopped.')
					.catch(err => console.log('Error stopping auction posting', err))
			}
		} else {
			enableInterval(minutes, message.channel)
				.catch(err => console.log('Error enabling auction posting interval', err))
		}
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ 'auction_int', 'auction_interval', 'auctioninterval' ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: "auction-interval",
	category: "System",
	description: "Auto Post Auction Summary",
	usage: " [tellTheChannel] ",
}
