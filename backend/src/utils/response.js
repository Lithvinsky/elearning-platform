export function sendSuccess(res, data, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function sendError(res, message, status = 400, errors) {
  return res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}
