import { environmentProductionHost, environmentProductionPort } from 'src/environments/hosts';
import { environmentProductionRecaptchaKey } from './settings';

export const environment = {
  showAds: false,
  showSupportSection: false,
  production: true,
  application: false,
  mediaUrl: 'https://' + environmentProductionHost + (environmentProductionPort ? ':' + environmentProductionPort : ''),
  apiUrl: 'https://' + environmentProductionHost + (environmentProductionPort ? ':' + environmentProductionPort : '') + '/api',
  wsUrl: 'wss://' + environmentProductionHost + (environmentProductionPort ? ':' + environmentProductionPort : '') + '/ws',
  recaptchaKey: environmentProductionRecaptchaKey,
  maxFileSizeUpload: 1000000,
};
