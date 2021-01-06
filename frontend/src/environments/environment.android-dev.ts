import { environmentDevHost, environmentDevPort } from 'src/environments/hosts';
import { environmentDevRecaptchaKey } from './settings';

export const environment = {
  showAuthButtons: false,
  showSupportSection: false,
  production: false,
  application: true,
  mediaUrl: 'https://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : ''),
  apiUrl: 'https://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : '') + '/api',
  wsUrl: 'wss://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : '') + '/ws',
  recaptchaKey: environmentDevRecaptchaKey,
  maxFileSizeUpload: 1000000,
};

