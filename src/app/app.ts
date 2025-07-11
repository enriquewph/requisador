import {Component} from '@angular/core';
import { DatabaseTestComponent } from './components/database-test.component';

@Component({
  selector: 'app-root',
  imports: [DatabaseTestComponent],
  template: `
    <app-database-test></app-database-test>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'Requisador de Requisitos';
}
