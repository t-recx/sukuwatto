import { environmentDevHost } from 'src/environments/hosts';

export const environment = {
  production: false,
  application: true,
  mediaUrl: 'https://' + environmentDevHost + ':8443',
  apiUrl: 'https://' + environmentDevHost + ':8443/api',
  wsUrl: 'wss://' + environmentDevHost + ':8443/ws',
  maxFileSizeUpload: 1000000,
};

