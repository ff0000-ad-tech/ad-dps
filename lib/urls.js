import * as origins from './origins.js'

export const getFeedUrl = (config, feed) => {
	if (!feed.ssid) {
		throw new Error(`adParams.dps.ssid is required to load DPS data`)
	}
	const env = config.env || 'prod'
	const url = origins[env]
	const route = '/dps/data'
	const qs = env === 'local' ? `?proxy=${url}` : ''
	if (feed.sid && feed.rid) {
		return `${url}${route}/${feed.ssid}/${feed.sid}/${feed.rid}${qs}`
	} else if (feed.sid) {
		return `${url}${route}/${feed.ssid}/${feed.sid}/*${qs}`
	} else {
		return `${url}${route}/${feed.ssid}/*${qs}`
	}
}
