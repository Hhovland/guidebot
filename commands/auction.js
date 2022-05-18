const getAuctionTotalsEmbed = require('../utility/get-auction-totals-embed')

module.exports = {
	name: 'auction',
	aliases: [ 'auction_totals' ],
	description: 'Get Auction Summary',
	usage: ' [auctionid]',
	execute(message, args) {
		const givenAuctionId = parseInt(args[0], 10) || null //NaN is falsy, which is the only other value that parseInt can return

		getAuctionTotalsEmbed(givenAuctionId)
			.then(embed => {
				message.channel.send({ embed })
			}).catch(error => {
				message.channel.send(`Error getting auction totals`)
				console.error(error.message)
			})
	},
}