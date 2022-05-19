const { database: dbConfig } = require('command-line-config').load('./config.json')
const getAuctionInfo = require('@isoftdata/auction')(dbConfig.berryhill)
const roundToQuarters = require('../utility/hours-to-quarters')

module.exports = async function getAuctionTotalsEmbed(givenAuctionId) {
	const {
		auctionName,
		auctionId,
		appraisedPrice,
		appraisedPriceTotal,
		totalSales,
		totalSalesAppraisedPercentage,
		internetSales,
		internetSalesIsoft,
		internetSalesPercentage,
		lotsPerHour,
		lotsRemaining,
		hoursLeft,
		finishesAt,
		percentComplete,
		mostRecentClerked,
	} = await getAuctionInfo(givenAuctionId)

	return {
		title: `${auctionName} (${auctionId})`,
		description: "---\n",
		author: {
			name: "Berryhill Auctioneers",
			url: "https://www.berryhillauctioneers.com/",
			icon_url: "https://www.berryhillauctioneers.com/images/balive.jpg",
		},
		color: 8036484,
		fields: [
			{
				name: "Progress",
				value: `${percentComplete}% (Lot ${mostRecentClerked})`,
				inline: true,
			},
			{
				name: "Lots per Hour",
				value: `${lotsPerHour} (${lotsRemaining} remaining)`,
				inline: true,
			},
			{
				name: "Time Left",
				value: `~${roundToQuarters(hoursLeft)}`,
				inline: true,
			},
			{
				name: "Appraised Value",
				value: `${appraisedPrice}\n(of ${appraisedPriceTotal})`,
				inline: true,
			},
			{
				name: "Total Sales",
				value: `${totalSales}\n(${totalSalesAppraisedPercentage}%)`,
				inline: true,
			},
			{
				name: "Internet Sales",
				value: `${internetSales}\n(${internetSalesIsoft})(${internetSalesPercentage}%)`,
				inline: true,
			},
			{
				name: "Estimated Completion",
				value: `${finishesAt}`,
			},
		],
	}
}