const { prefix } = require('../config.json')
const ud = require('urban-dictionary')

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	if (args && args.length > 0) {
		const term = args.map(arg => arg.trim()).join(' ')
		ud.define(term, (error, entries) => {
			if (error) {
				message.channel.send(`Error getting urban dictionary definition`)
				console.error(error.message)
			} else {
				//message.channel.send(entries[0].definition, { split: true })
				message.channel.send(entries[0].permalink)
			}
		})
	} else {
		message.channel.send(`**Usage:** ${prefix}ud <term>`)
	}
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "ud" ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: 'urban-dictionary',
	category: "System",
	description: 'Define using Urban Dictionary',
	usage: " term ",
}
