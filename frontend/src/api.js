const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : import.meta.env.DEV
    ? ''
    : 'https://doctor-appointment-ayjj.onrender.com'

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message
    throw new Error(message || `Request failed (${response.status}).`)
  }

  return data
}
