import { environmentDevHost, environmentDevPort } from 'src/environments/hosts';

export const environment = {
  production: false,
  application: true,
  mediaUrl: 'https://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : ''),
  apiUrl: 'https://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : '') + '/api',
  wsUrl: 'wss://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : '') + '/ws',
  maxFileSizeUpload: 1000000,
};

