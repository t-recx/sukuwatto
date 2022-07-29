const useSSL = false;
const recaptchaKey = null;
const host = 'localhost';
const port = null;

const apiHost = (useSSL ? 'https://' : 'http://') + host;
const webSocketsHost = (useSSL ? 'wss://' : 'ws://') + host;

export const environment = {
  production: true,
  mediaUrl: apiHost + (port ?? ''),
  apiUrl: apiHost + (port ?? '') + '/api',
  wsUrl: webSocketsHost + (port ?? '') + '/ws',
  recaptchaKey: recaptchaKey,
  useRecaptcha: recaptchaKey != null,
  maxFileSizeUpload: 1000000,
};
