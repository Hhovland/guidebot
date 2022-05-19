const { apiKeys } = require('command-line-config').load('./config.json')
const manuscript = require('manuscript-api')
const fAPI = manuscript('https://isoftdata.fogbugz.com/', apiKeys.fogbugz)

const priortyColors = {
	'1': 0xEB4D4D,
	'2': 0xEC8450,
	'3': 0xF0AA54,
	'4': 0xEFBF53,
	'5': 0xE2C27B,
	'6': 0xDAC592,
	'7': 0xC9C9C9,
}

async function getFogBugzCaseInfo({ caseNumber }) {
	if (!caseNumber) {
		throw 'Invalid case number'
	}

	const query = {
		"q": caseNumber,
		"cols": [ 'ixBug', 'tags', 'sStatus', 'sTitle', 'sProject', 'sArea', 'sPersonAssignedTo', 'sPriority', 'sFixFor', 'hrsOrigEst', 'sCategory', 'dtDue', 'ixPriority', 'sStatus', 'sCustomerEmail', 'sLatestTextSummary' ],
	}

	const response = await fAPI.search(query)
	const { cases } = response
	if (!cases[0]) {
		throw 'No matching cases'
	}
	const { sStatus, sTitle, sProject, sArea, sPersonAssignedTo, ixPriority, sPriority, sFixFor, sCategory, sCustomerEmail, sLatestTextSummary } = cases[0]

	let displayStatus = ''

	if (sStatus.indexOf('Resolved') > -1) {
		displayStatus = ` (${sStatus.trim()})`
	}

	let embed = {
		title: `${caseNumber}: ${sTitle.trim()}`,
		color: priortyColors[ixPriority],
		author: {
			name: "FogBugz",
			url: `https://isoftdata.fogbugz.com/`,
			icon_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSXWJwHXcljkzUmn_i3B5rpd_1GqOo5A18IE5csHueAQgWFu6jb",
		},
		url: `https://isoftdata.fogbugz.com/f/cases/${caseNumber}`,
		fields: [
			{
				name: 'Project',
				value: sProject,
				inline: true,
			},
			{
				name: 'Area',
				value: sArea,
				inline: true,
			},
			{
				name: 'Assigned To',
				value: `${sPersonAssignedTo}${displayStatus}`,
				inline: true,
			},
			{
				name: 'Priority',
				value: `${ixPriority}: ${sPriority}`,
				inline: true,
			},
			{
				name: 'Milestone',
				value: sFixFor,
				inline: true,
			},
			{
				name: 'Category',
				value: sCategory,
				inline: true,
			},
		],
	}

	if (sCustomerEmail) {
		embed.fields.push({
			name: 'Correspondent',
			value: sCustomerEmail,
			inline: true,
		})
	}

	embed.fields.push({
		name: 'Last Comment',
		value: sLatestTextSummary,
	})

	return embed
}

//getFogBugzCaseInfo({ caseNumber: 39612, detailed: true }).then(res => console.log(JSON.stringify(res, null, 2)))

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	const caseNumber = parseInt(args[0].trim(), 10)

		getFogBugzCaseInfo({ caseNumber }).then(embed => {
			message.channel.send({ embed })
		}).catch(error => {
			message.channel.send(`Error getting Fogbugz case info`)
			console.error(error.message)
		})
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "case" ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: 'case',
	category: "System",
	description: `Show Fogbugz case information`,
	usage: " [case] ",
}
