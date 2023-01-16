import pkg from 'axios';

const {AxiosError} = pkg;

export const handleAxiosError = (response, error) => {
  if (error instanceof AxiosError) {
    return response.status(error?.response?.status || 500).json({
      message: error.message,
    });
  }

  return response.status(500);
};

const createHandlerWithStatus = statusCode => {
  return (response, error) => {
    if (error instanceof Error) {
      return response.status(statusCode).json({
        message: error.message,
      });
    }

    return response.status(500);
  };
};

export const handleValidationError = createHandlerWithStatus(400);
export const handleAuthenticationError = createHandlerWithStatus(401);
