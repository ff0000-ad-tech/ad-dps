export const dpsFeedLoaded = (dpsFeed) => {
	document.dispatchEvent(new CustomEvent('dps-feed-loaded', { detail: dpsFeed }))
}

export const dpsImageRequested = (imageRequest) => {
	document.dispatchEvent(new CustomEvent('dps-image-requested', { detail: imageRequest }))
}

export const dpsPreflightComplete = () => {
	document.dispatchEvent(new CustomEvent('dps-preflight-complete'))
}
