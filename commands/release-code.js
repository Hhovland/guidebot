const getReleaseCode = require('@isoftdata/release-code-generator')
const isValidWorkstationCode = code => code.length === 7 && code.match(/^[0-9]+$/)

module.exports = {
	name: 'release-code',
	description: 'Get a release code for a workstation code',
	aliases: [ 'release_code', 'releasecode', 'rc' ],
	guildOnly: true,
	execute(message, args) {
		const workstationCode = args[0]

		if (message.guild.id == 492775522288271372) {
			if (!isValidWorkstationCode(workstationCode)) {
				return message.channel.send(`Invalid workstation code(${workstationCode})`)
			} else {
				return message.channel.send(getReleaseCode(workstationCode))
			}
		} else {
			return message.channel.send('Forbidden')
		}
	},
}