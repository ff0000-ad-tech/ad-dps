import * as routes from './routes.js'

export const getFeedUrl = (config) => {
	if (!config.ssid) {
		throw new Error(`adParams.dps.ssid is required to load DPS data`)
	}
	const env = config.env || 'prod'
	const url = routes.origins[env]
	const feed = routes.feeds[env]
	if (config.sid && config.rid) {
		return `${url}${feed}/${config.ssid}/${config.sid}/${config.rid}`
	} else if (config.sid) {
		return `${url}${feed}/${config.ssid}/${config.sid}/*`
	} else {
		return `${url}${feed}/${config.ssid}/*`
	}
}
