import * as c from './consts.js'

export const determine = mode => {
	let dpsMode
	// ?dps=... query-string will override adParams.dpsConfig.mode
	const match = window.location.href.match(/[?&]dps(=([^&#]*)|&|#|$)/)
	if (match) {
		// to cover confusion between ?dps=local and ?dps=dps-local
		// index uses: adParams.dpsConfig.mode = 'dps-local'
		const cleanEnv = match[2].replace(/dps-/, '')
		dpsMode = verifyDpsMode(`dps-${cleanEnv}`)
		if (!dpsMode) {
			console.error('Unrecognized query-string value for ?dps=')
		}
	}
	// adParams.dpsConfig.mode determines dps env
	else {
		dpsMode = verifyDpsMode(mode)
		if (!dpsMode) {
			console.error('Unrecognized adParams.dpsConfig.mode value')
		}
	}
	// or fallback to production
	if (!dpsMode) {
		dpsMode = c.MODE_PROD
	}
	console.log(` - DPS mode: ${dpsMode}`)
	return dpsMode
}

const verifyDpsMode = value => {
	switch (value) {
		case 'debug': // creative-server debug compile will always be MODE_LOCAL
		case c.MODE_LOCAL:
			return c.MODE_LOCAL
		case c.MODE_STAGING:
		case c.MODE_INLINED:
			return value
		case 'default': // creative-server traffic compile will always be MODE_PROD
		case c.MODE_PROD:
			return c.MODE_PROD
	}
}
