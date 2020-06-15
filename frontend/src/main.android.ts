import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

alert('aaaa');
let onDeviceReady = () => {
  alert('bbbb');
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
};

document.addEventListener('deviceready', onDeviceReady, false);