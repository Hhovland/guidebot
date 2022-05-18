const { prefix } = require('../config.json')
const ud = require('urban-dictionary')

module.exports = {
	name: 'urban-dictionary',
	aliases: [ 'ud' ],
	description: 'Define using Urban Dictionary',
	usage: ' term',
	execute(message, args) {
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
	},
}