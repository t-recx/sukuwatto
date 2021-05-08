// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { environmentDevHost, environmentDevPort } from 'src/environments/hosts';
import { environmentDevRecaptchaKey } from './settings';

export const environment = {
  showAds: true,
  showSupportSection: true,
  production: false,
  application: false,
  mediaUrl: 'https://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : ''),
  apiUrl: 'https://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : '') + '/api',
  wsUrl: 'wss://' + environmentDevHost + (environmentDevPort ? ':' + environmentDevPort : '') + '/ws',
  recaptchaKey: environmentDevRecaptchaKey,
  maxFileSizeUpload: 1000000,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
