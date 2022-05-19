const getAuctionTotalsEmbed = require('../utility/get-auction-totals-embed')

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	const givenAuctionId = parseInt(args[0], 10) || null //NaN is falsy, which is the only other value that parseInt can return

		getAuctionTotalsEmbed(givenAuctionId)
			.then(embed => {
				message.channel.send({ embed })
			}).catch(error => {
				message.channel.send(`Error getting auction totals`)
				console.error(error.message)
			})
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "auction_totals" ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: "auction",
	category: "System",
	description: 'Get Auction Summary',
	usage: " [auctionid] ",
}
