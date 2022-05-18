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

module.exports = {
	name: 'wiki',
	description: 'Useful Wiki Pages',
	execute(message) {
		message.channel.send({ embed: exampleEmbed })
	},
}