const exampleEmbed = {
	color: 0x0099ff,
	title: 'Favorite Wikis',
	fields: [
		{
			name: 'Barcode Formatting:',
			value: 'https://wikido.isoftdata.com/index.php?title=ITrack/Barcodes',
		},
		{
			name: 'Employee manual:',
			value: 'https://wikido.isoftdata.com/index.php/Internal:Employee_manual',

		},

	],
}


exports.run = async(client, message, args, level) => { // eslint-disable-line no-unused-vars
	message.channel.send({ embed: exampleEmbed })
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [ "wikido" ],
	permLevel: "User",
}

exports.help = {
	name: 'wiki',
	category: "Gimmick",
	description: 'Useful Wiki Pages',
	usage: " PostWikiPages ",
}
