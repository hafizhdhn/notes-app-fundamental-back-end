const response = (res, statusCode, message, data = null) => {
  const isSuccess = statusCode >= 200 && statusCode < 300;
  const isClientError = statusCode >= 400 && statusCode < 500;

  const responseBody = {
    status: isSuccess ? 'success' : (isClientError ? 'failed' : 'error'),
    message,
  };

  if (data !== null && data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
};

export default response;