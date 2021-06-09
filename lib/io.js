export const request = async (url) => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.open('GET', url, true)
		xhr.onload = (e) => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					try {
						return resolve(JSON.parse(xhr.responseText))
					} catch (err) {
						return resolve(xhr.responseText)
					}
				}
			}
			reject(xhr.statusText)
		}
		xhr.onerror = (err) => {
			reject(xhr.statusText)
		}
		xhr.send(null)
	})
}
