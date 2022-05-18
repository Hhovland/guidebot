const mysql = require('mysql')
const { query, queryFirst } = require('@isoftdata/utility-db')
const { database: dbConfig } = require('command-line-config').load('./config.json')
const { format: currencyFormat } = require('@isoftdata/utility-currency')
const asciiTable = require('ascii-table')

const MAX_MESSAGE_CHARS = 2000

async function guessCurrentAuction(connection) {
	const [ guessedAuction ] = await queryFirst(connection, `CALL p_guess_current_auction()`, { camelCase: true })
	let auction = guessedAuction

	if (!guessedAuction.auctionnum || (guessedAuction && !guessedAuction.isLive)) {
		//auction isn't live anymore. Try to fall back to one
		//in a finishing or closing state.
		auction = await queryFirst(connection, `SELECT auctions.name, auctionnum
			FROM auctions
			JOIN auctionstate USING (stateid)
			WHERE auctionstate.code IN('AUCTION_FINISHING', 'AUCTION_CLOSED')
			ORDER BY date DESC
			LIMIT 1`)
	}

	return auction
}

/* async function loadPartTypeAppraisals(connection, auctionNum, partTypeList) {
	return await query(connection, {
		sql: "SELECT \n" +
			"COUNT(*) AS `item_count`, \n" +
			"SUM(`appraisedprice`) AS `appraised_value`,  \n" +
			"SUM(inventory.`sellprice`) AS `sales`,  \n" +
			"IF(`inventory`.`typenum` IN (?), `part`,'OTHER') AS `part_type`, \n" +
			"typenum AS inventory_type_id \n" +
			"FROM `inventory` \n" +
			"JOIN `partuse` USING(`typenum`) \n" +
			"WHERE `inventory`.`auctionnum` = ? AND `inventory`.`status` IN ('C', 'S') \n" +
			"GROUP BY `part_type`",
		values: [
			partTypeList,
			auctionNum,
		],
	}, { camelCase: true })
} */

async function loadPartTypeAppraisals(connection, auctionNum, partTypeList) {
	return await query(connection, {
		sql: `SELECT
				IF(inventory.typenum IN (?), part,'_OTHER_') AS part_type,
				COUNT(*) AS tally,
				ROUND(SUM(appraisedprice)) AS appraised,
				ROUND(SUM(sellprice)) AS actual,
				ROUND((SUM(sellprice)/SUM(appraisedprice))*100) AS percent
				FROM inventory
				JOIN partuse USING(typenum)
				WHERE inventory.auctionnum = ? AND inventory.status IN ('C', 'S')
				GROUP BY part_type WITH ROLLUP;`,
		values: [
			partTypeList,
			auctionNum,
		],
	}, { camelCase: true })
}

async function loadFullPartTypeAppraisals(connection, auctionNum) {
	return await query(connection, {
		sql: `SELECT
				part AS part_type,
				COUNT(*) AS tally,
				ROUND(SUM(appraisedprice)) AS appraised,
				ROUND(SUM(sellprice)) AS actual,
				ROUND((SUM(sellprice)/SUM(appraisedprice))*100) AS percent
				FROM inventory
				JOIN partuse USING(typenum)
				WHERE inventory.auctionnum = ? AND inventory.status IN ('C', 'S')
				GROUP BY part WITH ROLLUP;`,
		values: [
			auctionNum,
		],
	}, { camelCase: true })
}

/* function buildEmbed(auction, appraisal) {
	const partTypeNumber = appraisal.partType === 'OTHER' ? '' : ` - ${appraisal.inventoryTypeId}`
	return {
		title: `${appraisal.partType}${partTypeNumber}`,
		author: {
			name: `Auction: ${auction.name}`,
			url: "https://www.berryhillauctioneers.com/",
			icon_url: "https://www.berryhillauctioneers.com/images/balive.jpg",
		},
		color: 8036484,
		fields: [
			{
				name: 'Appraised',
				value: currencyFormat(appraisal.appraisedValue || 0),
				inline: true,
			},
			{
				name: 'Sales',
				value: currencyFormat(appraisal.sales || 0),
				inline: true,
			},
			{
				name: 'Number of Items',
				value: appraisal.itemCount || 0,
				inline: true,
			},
		],
	}
} */

function shortenedString(string, maxLength = 25) {
	const ellipse = '...'

	if (string.length > maxLength) {
		return `${string.slice(0, maxLength - ellipse.length)}${ellipse}`
	} else {
		return string
	}
}

function buildTable(auction, appraisals) {
	const table = new asciiTable(auction.name)

	table.setHeading('part_type', 'count', 'appraised', 'actual', '%')
		.setAlignRight(1)
		.setAlignRight(2)
		.setAlignRight(3)
		.setAlignRight(4)

	appraisals.forEach(({ partType, tally, appraised, actual, percent }) => {
		if (partType === null) {
			table.addRow()
			partType = 'TOTAL'
		}

		table.addRow(shortenedString(partType), tally, currencyFormat(appraised || 0, { trimTrailing: true }), currencyFormat(actual || 0, { trimTrailing: true }), percent)
	})

	return table.toString()
}

function escapeCodeBlock(codeBlock) {
	return `\`\`\`${ codeBlock }\`\`\``
}

module.exports = {
	name: 'auction-part-types',
	aliases: [ 'auction-inventory-types', 'apt' ],
	description: 'See appraisal and sale information for given part types',
	async execute(message, args = []) {
		const partTypeList = args.length > 0 ? args : [ 3000, 4000, 4400, 4401, 4402, 5002, 4403, 1170 ]

		const connection = mysql.createConnection({ ...dbConfig.berryhill, database: 'itrackax' })

		const auction = await guessCurrentAuction(connection)
		let partTypeAppraisals

		if (args[0] === 'full') {
			partTypeAppraisals = await loadFullPartTypeAppraisals(connection, auction.auctionnum)
		} else {
			partTypeAppraisals = await loadPartTypeAppraisals(connection, auction.auctionnum, partTypeList)
		}

		connection.end()
		let codeBlock = buildTable(auction, partTypeAppraisals)
		let list = codeBlock.split("\n")
		//console.log(list.length)
		const longestLine = list.reduce((current, prev) => {
			if (current.length > prev.length) {
				return current
			}
			return prev
		}, 0)

		const maxLinesPerMessage = Math.floor(MAX_MESSAGE_CHARS / longestLine.length) - 1

		if (list.length > maxLinesPerMessage) {
			const numMessages = Math.ceil(list.length / maxLinesPerMessage)
			const linesPerMessage = Math.ceil(list.length / numMessages)
			for (let i = 0; i < numMessages; i++) {
				const splitTable = list.slice(i * linesPerMessage, (i + 1) * linesPerMessage).join("\n")
				message.channel.send(escapeCodeBlock(splitTable))
			}
		} else {
			message.channel.send(escapeCodeBlock(codeBlock))
		}
	},
}