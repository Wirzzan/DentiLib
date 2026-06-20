function getToken() {
  return localStorage.getItem("token");
}

function authHeaders(json = false) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

function authFetch(url, options = {}) {
  const json =
    options.body != null ||
    (options.headers && options.headers["Content-Type"] === "application/json");

  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders(json),
      ...(options.headers || {}),
    },
  });
}
