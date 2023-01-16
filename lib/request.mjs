export function validateParams(request, params) {
  params.forEach(param => {
    if (!request.query[param]) {
      throw new Error(`Missing param '${param}'`);
    }
  });
}

export function validateHeaders(request, headers) {
  headers.forEach(header => {
    if (!request.headers[header]) {
      throw new Error(`Missing header '${header}'`);
    }
  });
}
