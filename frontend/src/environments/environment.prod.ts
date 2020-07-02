import { environmentProductionHost } from 'src/environments/hosts';

export const environment = {
  production: true,
  application: false,
  mediaUrl: 'https://' + environmentProductionHost,
  apiUrl: 'https://' + environmentProductionHost + '/api',
  wsUrl: 'wss://' + environmentProductionHost + '/ws',
  maxFileSizeUpload: 1000000,
};
