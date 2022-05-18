const { apiKeys } = require('command-line-config').load('./config.json')
const manuscript = require('manuscript-api')
const fAPI = manuscript('https://isoftdata.fogbugz.com/', apiKeys.fogbugz)
const { prefix } = require('../config.json')

const channelProjectMap = new Map([
	[ '688143954079645861', { sProject: 'ITrack AX', sArea: 'General' }],
	[ '959131397698768926', { sProject: 'ITrack Enterprise', sArea: 'Misc' }],
	[ '959130625883914240', { sProject: 'Lawn Hiro', sArea: 'Misc' }],
	[ '687691517048913921', { sProject: 'Presage', sArea: 'Misc' }],
	[ '959131755917479968', { sProject: 'ITrack Pro', sArea: 'Misc' }],
	[ '687689078921101324', { sProject: 'Inbox', sArea: 'Undecided' }],
	[ '960916497331544084', { sProject: 'HeavyTruckParts.net', sArea: 'Framework' }],
])

const personMap = new Map([
	[ '772871020956090378', { ixPerson: 102, sFullName: 'Alex Jones' }],
	[ '687699157724561438', { ixPerson: 8, sFullName: 'Andrew Johnson' }],
	[ '835257995372920882', { ixPerson: 108, sFullName: 'Barbora Müllerová' }],
	[ '365213226243194882', { ixPerson: 5, sFullName: 'Brian Roy' }],
	[ '774026344212070470', { ixPerson: 104, sFullName: 'Brittni Wolff' }],
	[ '221753632566018061', { ixPerson: 106, sFullName: 'Charles Kaup' }],
	[ '240562790908035073', { ixPerson: 10, sFullName: 'Dayton Lowell' }],
	[ '300099619877158913', { ixPerson: 3, sFullName: 'Dillon Sadofsky' }],
	[ '725052084692713584', { ixPerson: 109, sFullName: 'Elsa Meyer' }],
	[ '689125687457742896', { ixPerson: 80, sFullName: 'Emily Epperson' }],
	[ '687647241510715399', { ixPerson: 14, sFullName: 'Emily Moore' }],
	[ '687695691417518126', { ixPerson: 88, sFullName: 'Gibran Hagemoser' }],
	[ '687697252625809420', { ixPerson: 67, sFullName: 'Gwyn Evans' }],
	[ '199032474574127104', { ixPerson: 112, sFullName: 'Harrison Hovland' }],
	[ '688056355457859629', { ixPerson: 75, sFullName: 'Holly Heffelbower' }],
	[ '786346935225155585', { ixPerson: 111, sFullName: 'Hope Anderson' }],
	[ '754058608886415552', { ixPerson: 100, sFullName: 'James Woody' }],
	[ '492779205923438603', { ixPerson: 64, sFullName: 'John Wise' }],
	[ '465353236748959765', { ixPerson: 59, sFullName: 'Jordan Bonge' }],
	[ '687734672523919456', { ixPerson: 51, sFullName: 'Justin Wheeler' }],
	[ '773314036401438750', { ixPerson: 103, sFullName: 'Katie Hundt' }],
	[ '444510102163030038', { ixPerson: 71, sFullName: 'Lisa Davis' }],
	[ '205427419841036288', { ixPerson: 9, sFullName: 'Mark Hardisty' }],
	[ '672196578450210859', { ixPerson: 6, sFullName: 'Matthew Wegener' }],
	[ '688135382084485194', { ixPerson: 66, sFullName: 'Nate Fryzek' }],
	[ '638762401747042304', { ixPerson: 97, sFullName: 'Robert McCown' }],
	[ '687693548853657676', { ixPerson: 2, sFullName: 'Tony Merritt' }],
	[ '952946967955271774', { ixPerson: 114, sFullName: 'Jacob Christensen' }],
	[ '948245511884898324', { ixPerson: 113, sFullName: 'Soon Yeap' }],

])

async function insertCase(title, options = {}) {
	const caseInfo = {
		sTitle: title,
		sTags: [ 'DiscordCreated' ],
		...options,
	}

	const data = await fAPI.new(caseInfo)

	return data.case.ixBug
}

module.exports = {
	name: 'makecase',
	description: `Quick Create Fogbugz Case`,
	aliases: [ 'cc', 'mc', 'createcase' ],
	async execute(message, args) {
		if (args && args.length > 0) {
			let lines = args.join(' ').split(/\r?\n/)
			const title = lines.shift()
			const description = lines.join('\n')

			const projectInfo = channelProjectMap.get(message.channel.id) || { sProject: "Misc", sArea: "Misc", ixPersonAssignedTo: 15 }
			const personInfo = personMap.get(message.author.id)
			const newCaseId = await insertCase(title, {
				...projectInfo,
				ixPersonEditedBy: personInfo ? personInfo.ixPerson : 15,
				...(description ? { sEvent: description } : {}),
			})

			message.channel.send(`Created case: https://isoftdata.fogbugz.com/f/cases/${newCaseId}`)
		} else {
			message.channel.send(`**Usage:** ${prefix}cc <case title>`)
		}
	},
}