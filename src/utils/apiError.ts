type ErrorResponsePayload = {
  message?: string | string[];
  error?: string;
  detail?: string;
};

const normalizeMessage = (message?: string | string[]): string | null => {
  if (!message) return null;

  if (Array.isArray(message)) {
    return message.filter(Boolean).join(", ") || null;
  }

  return message;
};

export const getApiErrorMessage = (error: unknown): string | null => {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: ErrorResponsePayload } }).response;
    const responseData = response?.data;

    const message = normalizeMessage(responseData?.message);
    if (message) return message;

    if (responseData?.error) return responseData.error;
    if (responseData?.detail) return responseData.detail;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return null;
};

