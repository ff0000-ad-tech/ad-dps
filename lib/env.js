import * as c from './consts.js'

const determine = (envId) => {
	let dpsEnv
	// ?dps=... query-string will override adParams.environmentId
	const match = window.location.href.match(/[?&]dps(=([^&#]*)|&|#|$)/)
	if (match) {
		console.error(match[2])
		// to cover confusion between ?dps=local and ?dps=dps-local
		// index uses: adParams.environmentId = 'dps-local'
		const cleanEnv = match[2].replace(/dps-/, '')
		dpsEnv = verifyDpsEnv(`dps-${cleanEnv}`)
		if (!dpsEnv) {
			console.error('Unrecognized query-string value for ?dps=')
		}
	}
	// adParams.environmentId determines dps env
	else {
		console.log(envId)
		dpsEnv = verifyDpsEnv(envId)
		if (!dpsEnv) {
			console.error('Unrecognized adParams.environmentId value for DPS')
		}
	}
	// or fallback to production
	if (!dpsEnv) {
		dpsEnv = c.ENV_PROD
	}
	console.log(` - DPS using environment ${dpsEnv}`)
	return dpsEnv
}

const verifyDpsEnv = (value) => {
	switch (value) {
		case 'debug': // creative-server debug compile will always be ENV_LOCAL
		case c.ENV_LOCAL:
			return c.ENV_LOCAL
		case c.ENV_STAGING:
		case c.ENV_INLINED:
			return value
		case 'default': // creative-server traffic compile will always be ENV_PROD
		case c.ENV_PROD:
			return c.ENV_PROD
	}
}

module.exports = {
	determine
}
