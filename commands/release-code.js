const getReleaseCode = require('@isoftdata/release-code-generator')
const isValidWorkstationCode = code => code.length === 7 && code.match(/^[0-9]+$/)

exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
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
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ 'release_code', 'releasecode', 'rc' ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: 'release-code',
	category: "System",
	description: 'Get a release code for a workstation code',
	usage: " PostReleaseNotice ",
}
