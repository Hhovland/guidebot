const { prefix } = require('../config.json')

module.exports = {
	name: 'barcode',
	aliases: [ 'bc' ],
	description: 'Get a Code39 barcode image',
	usage: ' term',
	execute(message, args) {
		if (args && args.length > 0) {
			const term = args.map(arg => arg.trim().toUpperCase()).join(' ')

			const url = `https://barcode.tec-it.com/barcode.ashx?code=Code39&modulewidth=fit&dpi=96&imagetype=gif&rotation=0&color=&bgcolor=&fontcolor=&quiet=4&qunit=mm&data=${term}`
			message.channel.send(url)
		} else {
			message.channel.send(`**Usage:** ${prefix}barcode <term>`)
		}
	},
}