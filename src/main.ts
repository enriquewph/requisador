/*
 *  Protractor support is deprecated in Angular.
 *  Protractor is used in this example for compatibility with Angular documentation tools.
 */
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {App} from './app/app';

bootstrapApplication(App, {
  providers: [
    provideProtractorTestingSupport(),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: 'light',
          cssLayer: false
        }
      }
    })
  ]
}).catch((err) =>
  console.error(err),
);
