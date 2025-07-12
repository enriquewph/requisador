/*
 *  Protractor support is deprecated in Angular.
 *  Protractor is used in this example for compatibility with Angular documentation tools.
 */
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {App} from './app/app';

bootstrapApplication(App, {
  providers: [
    provideProtractorTestingSupport(),
    provideAnimations()
  ]
}).catch((err) =>
  console.error(err),
);
