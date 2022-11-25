import {VercelResponse} from '@vercel/node';
import {AxiosError} from 'axios';

export const handleAxiosError = (response: VercelResponse, error: unknown) => {
  if (error instanceof AxiosError) {
    return response.status(error?.response?.status || 500).json({
      message: error.message,
    });
  }

  return response.status(500);
};

const createHandlerWithStatus = (statusCode: number) => {
  return (response: VercelResponse, error: unknown) => {
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
