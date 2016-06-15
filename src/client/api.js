export function del (url) {
	return fetch(url, {
		credentials: 'same-origin',
	  method: 'DELETE',
	  headers: {
	    'Accept': 'application/json'
	  }
	})
	.then(handleUnauthorized)
	.then(checkStatus)
  .then(parseJSON);
}

export function get (url) {
	return fetch(url, {
		credentials: 'same-origin',
	  headers: {
	    'Accept': 'application/json',
	  },
		method: 'GET'
	})
	.then(handleUnauthorized)
	.then(checkStatus)
  .then(parseJSON);
}

export function patch (url, data) {
	return fetch(url, {
		body: JSON.stringify(data),
		credentials: 'same-origin',
	  method: 'PATCH',
	  headers: {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	  }
	})
	.then(handleUnauthorized)
	.then(checkStatus)
  .then(parseJSON);
}

export function post (url, data) {
	return fetch(url, {
		body: JSON.stringify(data),
		credentials: 'same-origin',
	  method: 'POST',
	  headers: {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	  }
	})
	.then(handleUnauthorized)
	.then(checkStatus)
  .then(parseJSON);
}

export function put (url, data) {
	return fetch(url, {
		body: JSON.stringify(data),
		credentials: 'same-origin',
	  method: 'PUT',
	  headers: {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	  }
	})
	.then(handleUnauthorized)
	.then(checkStatus)
  .then(parseJSON);
}

function handleUnauthorized(response) {
	if (response.status === 401) {
		document.location.href = `/login?redirectUrl=${document.location.href}`;
	}

	return response;
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response) {
	return response.json().catch(() => undefined);
}
