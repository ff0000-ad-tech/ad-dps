import * as urls from './urls.js'
import * as io from './io.js'

/**
 * Request feed data over the wire.
 */
export const load = async (dpsConfig, feed) => {
	// if data has been hard-coded
	if (feed.data) {
		return prune(parse(feed.data), feed)
	}
	// otherwise make request for data
	const url = urls.getFeedUrl(dpsConfig, feed)
	const data = await io.request(url)
	return prune(parse(data), feed)
}

const parse = (data) => {
	return typeof data === 'string' ? JSON.parse(data) : data
}

/**
 * Pruning isolates the specific feed object
 * from the parent-key it belongs to.
 *
 * For example, a request for a row would result in:
 * 	{	[rid]: { ...rowData }	}
 *
 * Instead, assuming a rid was provided, the result is:
 * 	{ ...rowData }
 *
 */
const prune = (data, { ssid, sid, rid }) => {
	data = ssid in data ? data[ssid] : data
	data = sid in data ? data[sid] : data
	data = rid in data ? data[rid] : data
	return data
}

/**
 * Enables dot-pathing to data.
 *
 */
export const reduceColumnPath = (columnPath, target) => {
	return columnPath.split('.').reduce((acc, column) => {
		if (!acc || typeof acc !== 'object') {
			return
		}
		if (column in acc) {
			return acc[column]
		}
	}, target)
}
