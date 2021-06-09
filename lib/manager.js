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
 */
export const getImageRequest = (data, columnDotPath, { forCanvas } = {}) => {
	console.log(`DpsManager.getImageRequest() for column '${columnDotPath}'`)
	// convert dot-notation column into references
	const scope = columnDotPath.split('.').reduce((acc, key, i) => {
		if (!acc[key]) {
			throw new Error(`Cannot find key '${key}' ${i > 0 ? `in '${columnDotPath}' ` : ``}in dpsData.`)
		}
		return acc[key]
	}, data)
	// image requests will always be objects like, { filename: url }
	if (typeof scope !== 'object') {
		throw new Error(`Requested image at '${columnDotPath}' in dpsData does not appear to be a DPS-Sources object.`)
	}
	// assume only one asset per row, despite ability to upload multiple sources
	const paths = Object.values(scope)
	// also images may have been baked into the fba-payload, if so return nothing
	if (paths.length && paths[0] !== 'fba-bundled') {
		if (typeof paths[0] !== 'string' || !paths[0].match(/^http/)) {
			console.error(`Requested image at '${columnDotPath}' in dpsData does not appear to be a DPS-Sources object.`)
		}
		return { src: paths[0], imageId: columnDotPath, forCanvas }
	}
}
