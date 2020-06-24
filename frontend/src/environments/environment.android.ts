import { environmentProductionHost } from 'src/environments/hosts';

export const environment = {
  production: true,
  application: true,
  mediaUrl: 'https://' + environmentProductionHost + ':8443',
  apiUrl: 'https://' + environmentProductionHost + ':8443/api',
  wsUrl: 'wss://' + environmentProductionHost + ':8443/ws',
  maxFileSizeUpload: 1000000,
};
