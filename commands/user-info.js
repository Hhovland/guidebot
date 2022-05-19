exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	poll(message, args, '+', '#00D1CD')
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "ui" ],
	permLevel: "Bot Admin",
}

exports.help = {
	name: 'user-info',
	category: "System",
	description: 'Display info about yourself',
	usage: " Post info ",
}
