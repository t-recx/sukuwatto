import { environmentProductionHost, environmentProductionPort } from 'src/environments/hosts';

export const environment = {
  production: true,
  application: true,
  mediaUrl: 'https://' + environmentProductionHost + environmentProductionPort ? ':' + environmentProductionPort : '',
  apiUrl: 'https://' + environmentProductionHost + environmentProductionPort ? ':' + environmentProductionPort : '' + '/api',
  wsUrl: 'wss://' + environmentProductionHost + environmentProductionPort ? ':' + environmentProductionPort : '' + '/ws',
  maxFileSizeUpload: 1000000,
};
