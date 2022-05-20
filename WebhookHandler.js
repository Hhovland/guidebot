const { time } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

const botChannelId = "973236937404080129"
const serverId = "483076478251171851"

const messageCache = new Map()
const statusCache = new Map()
const timeCache = new Map()

const callStatusMap = new Map([
	[ 'call.dialog.confirmed', { result: 'Call Answered', color: 60928 } ],
	[ 'call.dialog.created', { result: 'Incoming Call', color: 255 } ],
	[ 'call.dialog.terminated', { result: 'Call Ended', color: 30 } ],
	[ 'call.dialog.failed', { result: 'Call not Answered', color: 16711680 } ],
])

const ISoftNum = "4024353850"
const OnSIPMap = new Map([
	[ "sip:isoft.menu@isoftdata.onsip.com", "Call Menu" ],
	[ `${ISoftNum }107`, "Justin Wheeler" ],
	[ `${ISoftNum }121`, "Holly Heffelbower" ],
	[ "ghagemoser@isoftdata.onsip.com", "Gibran Hagemoser" ],
	[ `${ISoftNum }130`, "James Woody" ],
	[ "sip:ajones@isoftdata.onsip.com", "Alex Jones" ],
	[ `${ISoftNum }100`, "Emily Moore" ],
	[ `${ISoftNum }101`, "Matthew Wegener" ],
	[ "sip:eepperson@isoftdata.onsip.com", "Emily Epperson" ],
	[ `${ISoftNum }111`, "Tony Merritt" ],
	[ `${ISoftNum }119`, "Gwyn Evans" ],
	[ `${ISoftNum }301`, "Voicemail" ],
	[ `${ISoftNum }102`, "Dayton Lowell" ],
	[ `${ISoftNum }105`, "Dillon Sadofsky" ],
	[ `${ISoftNum }108`, "Mark Hardisty" ],
	[ `${ISoftNum }202`, "Web Dev" ],
	[ `${ISoftNum }113`, "Brian Roy" ],
	[ `${ISoftNum }118`, "Jordan Bonge" ],
	[ "sip:vm.jchristensen@isoftdata.onsip.com", "Jake Christensen" ],
	[ "sip:eehuntgroup@isoftdata.onsip.com", "EEhuntGroup" ],
	[ "sip:htp.support.hunt.group@isoftdata.onsip.com", "Support Hunt Group" ],
	[ "sip:vm.elowell@isoftdata.onsip.com", "E Lowell" ],
	[ "sip:default.hunt@isoftdata.onsip.com", "Default Hunt" ],
	[ "sip:vm.nfryzek@isoftdata.onsip.com", "N Fryzek" ],
	[ "sip:presage.menu@isoftdata.onsip.com", "Presage Menu" ],
	[ "sip:tech.support@isoftdata.onsip.com", "Tech Support" ],
])
/*
Embed Messege SEnder

Functions involved in sending messages
*/
//eslint-disable-next-line
async function createNewEmbed({ type: id, streamId, payload, type }) {
	const { toUri, fromUri } = payload
    await timeMapper(streamId, type)
	try {
		let supportTarget = OnSIPMap.get(toUri) || toUri
		let customerTarget = OnSIPMap.get(fromUri) || fromUri
		const newEmbed = new MessageEmbed()
			.setColor(callStatusMap.get(statusCache.get(streamId)).color)
			.setTitle(`Call From: ${customerTarget}`)
			.setDescription(`Id: ${streamId}`)
			.addFields(
				{
					name: "Call Directed At", value: `${supportTarget}`,
				},
				{
					name: "Timestamps", value: `${timeCache.get(streamId)}`,
				},
			)
		return newEmbed
	} catch (err) {
		console.error(err)
	}
}
//eslint-disable-next-line
async function createEditedEmbed({ type: id, streamId, payload, type }) {
	const { toUri, fromUri } = payload
    await timeMapper(streamId, type, timeCache.get(streamId))
	try {
		let supportTarget = OnSIPMap.get(toUri) || toUri
		let customerTarget = OnSIPMap.get(fromUri) || fromUri
		const newEmbed = new MessageEmbed()
			.setColor(callStatusMap.get(statusCache.get(streamId)).color)
			.setTitle(`Call From: ${customerTarget}`)
			.setDescription(`Id: ${streamId}`)
			.addFields(
				{
					name: "Call Directed At", value: `${supportTarget}`, inline: true,
				},
				{
					name: "Timestamps", value: `${timeCache.get(streamId)}`,
				},
			)
		return newEmbed
	} catch (err) {
		console.error(err)
	}
}

function dateTime() {
	var datum = +new Date()
	return new Date(datum)
}

function timeMapper(streamId, callStatus, times = [ "Created: ", "Confirmed: ", "Terminated: ", "Failed:" ]) {
	if (callStatus == "call.dialog.terminated") {
		times[2] = times[2] + dateTime()
		return timeCache.set(streamId, times)
	} else if (callStatus == "call.dialog.failed") {
		times[3] = times[3] + dateTime()
		return timeCache.set(streamId, times)
	} else if (callStatus == "call.dialog.confirmed") {
		times[1] = times[1] + dateTime()
		return timeCache.set(streamId, times)
	} else if (callStatus == "call.dialog.created") {
		times[0] = times[0] + dateTime()
		return timeCache.set(streamId, times)
	}
}

function cacheDeleteCondition(streamId, callStatus) {
	if (callStatus == "call.dialog.terminated") {
		statusCache.delete(streamId)
		timeCache.delete(streamId)
		messageCache.delete(streamId)
	} else if (callStatus == "call.dialog.failed") {
		statusCache.delete(streamId)
		timeCache.delete(streamId)
		messageCache.delete(streamId)
	}
}

function msgStatusMapper(streamId, callStatus) {
    const validStatuses = [
        'terminated',
        'failed',
        'confirmed',
        'created',
    ].map(status => `call.dialog.${status}`)

    if(validStatuses.includes(callStatus)) {
        return statusCache.set(streamId, callStatus)
    }
}

async function messageSend(body, client) {
    const channel = await client.channels.fetch(botChannelId)
    if (!channel) {
        return
    } // if the channel is not in the cache return and do nothing
    const { streamId, type } = body
    await msgStatusMapper(streamId, type)
    let embed
    try {
        if (await messageCache.has(streamId)) {
            embed = await createEditedEmbed(body)
            const message = await channel.messages.fetch(messageCache.get(streamId))
            message.edit({embeds: [embed]})
        } else {
            embed = await createNewEmbed(body)
            const sent = await channel.send({embeds: [embed]})
            messageCache.set(streamId, sent.id)
        }
    } catch(err) {
        console.error(err)
    } finally {
        cacheDeleteCondition(streamId, body.type)
    }
}

module.exports = messageSend
