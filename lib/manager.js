import * as urls from './urls.js'
import * as io from './io.js'

/**
 * Load DPS Data, 
 * and prunes result to index 
 * requested ssid/sid/rid 
 * 
	dpsConfig 		<object>		defined in Index.adParams
		{
			data: 		<string> 		valid JSON-string, representing hard-coded data for this ad to render
			env: 			<string> 		origin from which to load DPS data
									'prod'			velvet-dps.tech
									'staging'		staging.velvet-dps.tech
									'local'			localhost:10200
			ssid: 		<string> 		matching a Google Spreadsheet ID
			sid: 			<string> 		matching a Google Sheet Tab ID, expected to exist in specified ssid
			rid: 			<string> 		matching a DPS Row ID, expected to exist in specified ssid/sid
		}
 */
export const load = async (dpsConfig) => {
	console.log(`DpsManager.load()`)
	// if data has been hard-coded
	if (dpsConfig.data) {
		return pruneToRow(parse(dpsConfig.data), dpsConfig.rid)
	}
	// otherwise make request for data
	const url = urls.getFeedUrl(dpsConfig)
	const data = await io.request(url)
	const res = pruneToRow(parse(data), dpsConfig.rid)
	// print result to console for clarity
	console.log(res)
	return res
}

const parse = (data) => {
	return typeof data === 'string' ? JSON.parse(data) : data
}
const pruneToRow = (data, rid) => {
	if (rid in data) {
		return data[rid]
	}
	return data
}

/**
 * Extract an http request for a DPS asset,
 * given an object of dps-data and a column-name.
 *
 *	@param dpsSource {object} Required, DPS-Sources object like { image: url }
 *	@param imageId {string} Required, the name by which this image can be retrieved with ImageManager.
 *
 *	@param forCanvas {boolean} Optional, adds cross-origin trust in order to read image byte-array
 *
 */
export const getImageRequest = (dpsSource, imageId, { forCanvas } = {}) => {
	console.log(`DpsManager.getImageRequest()`)
	console.log({ dpsSource })

	// image requests will always be objects like, { filename: url }
	if (typeof dpsSource !== 'object') {
		throw new Error(`'dpsSource' does not appear to be a DPS-Sources object, like { image: url }.`)
	}

	// assume only one asset per row, despite ability to upload multiple sources
	const sources = Object.entries(dpsSource)

	// also images may have been baked into the fba-payload, if so return nothing
	if (sources.length && sources[0][1] !== 'fba-bundled') {
		if (typeof sources[0][1] !== 'string' || !sources[0][1].match(/^http/)) {
			throw new Error(`Requested dpsSource does not appear to be a DPS-Sources object.`)
		}
		console.log(`  '${sources[0][0]}' available at ImageManager.get('${imageId}')`)
		return { src: sources[0][1], imageId, forCanvas }
	}
}

/**
 * Find a key
 */
