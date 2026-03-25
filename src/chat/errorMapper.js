const STATUS_HELP = {
  400: 'The request was not valid. Please check the details and try again.',
  404: 'I could not find that resource. Please verify the ID and try again.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  500: 'The server had an issue processing the request. Please try again shortly.',
};

export const mapBackendErrorToChatMessage = (error, fallbackMessage) => {
  const status = error?.response?.status;
  const payload = error?.response?.data;
  const backendStatus = payload?.status;
  const backendMessage = payload?.message;

  if (typeof backendStatus === 'number' && typeof backendMessage === 'string' && backendMessage.trim()) {
    return `Request failed (${backendStatus}): ${backendMessage}`;
  }

  if (typeof status === 'number' && STATUS_HELP[status]) {
    return `Request failed (${status}): ${STATUS_HELP[status]}`;
  }

  return fallbackMessage || 'Something went wrong while contacting the server. Please try again.';
};

export default mapBackendErrorToChatMessage;
