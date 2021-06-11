export const dpsFeedsLoaded = (dpsFeeds) => {
	document.dispatchEvent(new CustomEvent('dps-feeds-loaded', { detail: dpsFeeds }))
}

export const dpsImageRequested = (imageRequest) => {
	document.dispatchEvent(new CustomEvent('dps-image-requested', { detail: imageRequest }))
}

export const dpsPreflightComplete = () => {
	document.dispatchEvent(new CustomEvent('dps-preflight-complete'))
}
