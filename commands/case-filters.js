const { apiKeys } = require('command-line-config').load('./config.json')
const manuscript = require('manuscript-api')
const fAPI = manuscript('https://isoftdata.fogbugz.com/', apiKeys.fogbugz)

function buildFiltersEmbed(filters) {
	let embed = {
		title: `Filters List`,
		author: {
			name: "FogBugz",
			url: `https://isoftdata.fogbugz.com/`,
			icon_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSXWJwHXcljkzUmn_i3B5rpd_1GqOo5A18IE5csHueAQgWFu6jb",
		},
		url: `https://isoftdata.fogbugz.com/f/filters/`,
		fields: filters.map(({ name, sFilter }) => {
			return {
				name,
				value: `https://isoftdata.fogbugz.com/f/filters/${sFilter}`,
			}
		}),
	}

	return embed
}

async function handleRequest(filterStartsWith) {
	const response = await fAPI.listFilters()

	let filters = response.filters
		.filter(filter => typeof (filter) === 'object' && parseInt(filter.sFilter, 10))
		.map(filter => {
			return {
				...filter,
				name: filter['#cdata-section'] || filter['#text'],
			}
		})

	return filters.filter(filter => filter.name.toLowerCase().indexOf(filterStartsWith.toLowerCase()) > -1)
}

//handleRequest('Inbox').then(res => console.log(JSON.stringify(res, null, 2)))

module.exports = {
	name: 'filters',
	description: `Show Fogbugz case filters`,
	execute(message, args) {
		let filterStartsWith = args[0] || ''
		filterStartsWith = filterStartsWith.trim()

		if (!filterStartsWith) {
			return message.channel.send(`Error: please provide a bit of text from the filter name`)
		}

		handleRequest(filterStartsWith).then(filters => {
			if (filters.length > 25) {
				return message.channel.send(`Error: too many filters to show. Please provide a more specific name`)
			}

			message.channel.send({ embed: buildFiltersEmbed(filters) })
		})
	},
}