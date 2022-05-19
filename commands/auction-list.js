const mysql = require('mysql')
const db = require('@isoftdata/utility-db')
const q = require('sql-concat')
const { database: dbConfig } = require('command-line-config').load('./config.json')
const getAuctionInfo = require('@isoftdata/auction')(dbConfig.berryhill)

async function getAuctionList() {
	const mysqlConnection = mysql.createConnection({
		...dbConfig.berryhill,
		database: 'itrackax',
		dateStrings: true,
	})

	try {
		const baseQuery = q.select(...[
			'`auctionid` AS auction_id',
			'`date`',
			'`auctions`.`name`',
			'`auctions`.`location`',
			'`auctionstate`.`name` AS `state`',
		])
			.from('auctions')
			.join('auctionstate', 'auctionstate.stateid = auctions.stateid')

		const queryPast = baseQuery
			.where('`date`', '<=', q`NOW()`)
			.orderBy('`date` DESC')
			.limit('0,3')
			.build()

		const queryFuture = baseQuery.where('`date`', '>', q`NOW()`).build()

		const auctionQuery = `( ${mysql.format(queryPast.sql, queryPast.values)} ) UNION( ${mysql.format(queryFuture.sql, queryFuture.values)} ) ORDER BY \`date\``

		return await db.query(mysqlConnection, auctionQuery, { camelCase: true })
	} finally {
		mysqlConnection.end()
	}
}

async function makeEmbed(auctionList) {
	const currentAuction = await getAuctionInfo()

	return {
		title: `Auction List`,
		description: auctionList.map(({ auctionId, name, date, location, state }) => {
			let currentAuctionIdentifier = ''
			if (auctionId == currentAuction.auctionId) {
				currentAuctionIdentifier = '⭐ '
			}
			return `**${auctionId} - ${name}** (${currentAuctionIdentifier}${state})\n${date} in ${location}`
		}).join('\n\n'),
	}
}

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	getAuctionList().then(async auctionList => {
		const embed = await makeEmbed(auctionList)
		message.channel.send({ embed })
	}).catch(err => {
		console.log(err)
		message.author.send(`Error getting auction list`)
	})
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "al" ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: "auctionlist",
	category: "System",
	description: 'Shows recent and upcomming auctions',
	usage: " [tellTheChannel] ",
}
