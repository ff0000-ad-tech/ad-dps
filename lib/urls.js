import * as origins from './origins.js'
import * as c from './consts.js'

export const getFeedUrl = (dpsEnv, feed) => {
	if (!feed.ssid) {
		throw new Error(`adParams.dps.ssid is required to load DPS data`)
	}
	const url = origins.getOrigin(dpsEnv)
	const route = '/dps/data'
	const qs = dpsEnv === c.MODE_LOCAL ? `?proxy=${url}` : ''
	if (feed.sid && feed.rid) {
		return `${url}${route}/${feed.ssid}/${feed.sid}/${feed.rid}${qs}`
	} else if (feed.sid) {
		return `${url}${route}/${feed.ssid}/${feed.sid}/*${qs}`
	} else {
		return `${url}${route}/${feed.ssid}/*${qs}`
	}
}
