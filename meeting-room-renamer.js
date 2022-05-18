const got = require('got')
const IcalExpander = require('ical-expander')
//const ical = require('ical.js')
//const parseISO = require('date-fns/parseISO')
const formatDate = require('date-fns/format')
const isThisMinute = require('date-fns/isThisMinute')
const endOfToday = require('date-fns/endOfToday')

const icalISoftGeneralCalendarUrl = 'https://calendar.google.com/calendar/ical/isoftdata.com_15gmhtddmpnee4s62b8cloqg50%40group.calendar.google.com/private-2ad0bdf82a7cc93bc9c3c6fd49fb6e4b/basic.ics'
const oneMinute = 60000

let roomEventCache = []
let zoomEventCache = []

function roomNameInString(roomList, string = '') {
	let inRoom = false
	for (const room in roomList) {
		if (string.toLowerCase().indexOf(room.toLowerCase()) > -1) {
			inRoom = room
			break
		}
	}
	return inRoom
}

async function loadCalendarEvents() {
	const icalResponse = await got(icalISoftGeneralCalendarUrl)
	const icalExpander = new IcalExpander({ ics: icalResponse.body, maxIterations: 100 })
	const events = icalExpander.between(new Date(), endOfToday())

	const mappedEvents = events.events.map(event => {
		return {
			title: event.summary || '',
			location: event.location || '',
			description: event.description || '',
			startDateTime: event.startDate.toJSDate(),
			endDateTime: event.endDate.toJSDate(),
		}
	})
	const mappedOccurrences = events.occurrences.map(occurrence => {
		return {
			title: occurrence.item.summary || '',
			location: occurrence.item.location || '',
			description: occurrence.item.description || '',
			startDateTime: occurrence.startDate.toJSDate(),
			endDateTime: occurrence.endDate.toJSDate(),
		}
	})
	return [].concat(mappedEvents, mappedOccurrences)
}

function getMeetingEventsInRooms(events, roomList) {
	console.log('meetingEventsInRooms', events.sort((a, b) => {
		if (a.startDateTime < b.startDateTime) {
			return -1
		}

		if (a.startDateTime > b.startDateTime) {
			return 1
		}

		return 0
	}))

	const meetingEventsInRooms = events.map(event => {
		return {
			...event,
			inRoom: (roomNameInString(roomList, event.title) || roomNameInString(roomList, event.location) || roomNameInString(roomList, event.description)),
		}
	}).filter(event => {
		const title = event.title.toLowerCase() || ''
		return title.indexOf('meeting') > -1 && event.inRoom
	})

	return meetingEventsInRooms
}

function getActiveMeetings(events) {
	const now = new Date()
	const activeMeetings = events.filter(event => {
		return now >= event.startDateTime && now <= event.endDateTime
	})
	console.log('activeMeetings', activeMeetings)
	return activeMeetings
}

function detectUrls(message) {
	const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g
	return message.match(urlRegex)
}

function zoomLinkInString(string) {
	const urls = detectUrls(string)
	if (urls) {
		return urls.find(url => url.indexOf('zoom.us/j') > -1)
	}

	return urls
}

function getMeetingsWithZoomLinks(events) {
	return events.map(event => {
		return {
			...event,
			zoomLink: zoomLinkInString(event.location) || zoomLinkInString(event.description),
		}
	}).filter(event => event.zoomLink)
}

async function loadMeetingEventsInRooms(roomList) {
	let events = await loadCalendarEvents()
	roomEventCache = getMeetingEventsInRooms(events, roomList)
	zoomEventCache = getMeetingsWithZoomLinks(events)

	return roomEventCache
}

async function loadActiveMeetingsInRooms(roomList) {
	const events = await loadMeetingEventsInRooms(roomList)

	return getActiveMeetings(events)
}

function groupEventsByRoom(events, roomList) {
	let byRoom = {}

	for (const room in roomList) {
		byRoom[room] = events.filter(event => event.inRoom === room)
	}

	return byRoom
}

function buildVoiceChannelName(eventName) {
	const maxLengthRoomName = 100
	return eventName.length > maxLengthRoomName ? `${eventName.slice(0, 96)}...` : eventName
}

async function setRoomName(client, voiceChannelId, voiceChannelName) {
	const voiceChannel = await client.channels.fetch(voiceChannelId)
	await voiceChannel.setName(buildVoiceChannelName(voiceChannelName))
}

async function setRoomNames(client, roomEvents, roomList) {
	const eventsByRoom = groupEventsByRoom(roomEvents, roomList)

	for (const room in eventsByRoom) {
		await setRoomName(client, roomList[room], (eventsByRoom[room].length === 0) ? room : (eventsByRoom[room][0].title || room))
	}
}

async function messageZoomEventStartIfNeeded(client, zoomEvents, isoftGeneralChannelId) {
	if (zoomEvents.length > 0) {
		const zoomEventsStartingThisMinute = zoomEvents.filter(event => isThisMinute(event.startDateTime))
		if (zoomEventsStartingThisMinute.length > 0) {
			try {
				console.log(zoomEventsStartingThisMinute)
				const textChannel = await client.channels.fetch(isoftGeneralChannelId)
				for (const { title, zoomLink } of zoomEventsStartingThisMinute) {
					await textChannel.send(`${title}: ${zoomLink}`)
					console.log('success')
				}
			} catch (err) {
				console.error('error posting zoom event start', err)
			}
		}
	}
}
const main = async(client, channelIds) => {
	const roomList = channelIds.voice
	const isoftGeneral = channelIds.text.isoftGeneral
	//Set the initial state of the meeting rooms
	const activeEvents = await loadActiveMeetingsInRooms(roomList)
	await setRoomNames(client, activeEvents, roomList)

	async function updateRoomNamesEveryMinute() {
		await Promise.all([
			setRoomNames(client, getActiveMeetings(roomEventCache), roomList),
			messageZoomEventStartIfNeeded(client, zoomEventCache, isoftGeneral),
		])

		setInterval(async() => {
			try {
				await Promise.all([
					setRoomNames(client, getActiveMeetings(roomEventCache), roomList),
					messageZoomEventStartIfNeeded(client, zoomEventCache, isoftGeneral),
				])
			} catch (err) {
				console.error('Error setting room names', err)
			}
		}, oneMinute)
	}

	//Using the current time, get the seconds as an int so we can
	//start the interval on the even minute. eg. 4:20:00 rather than 4:20:42
	const currentTimeSeconds = parseInt(formatDate(new Date(), 's'), 10)
	setTimeout(updateRoomNamesEveryMinute, (60 - currentTimeSeconds) * 1000)

	//Every 15 minutes we'll cache the latest calendar info from Google
	setInterval(() => loadMeetingEventsInRooms(roomList), (oneMinute * 15))
}

module.exports = main