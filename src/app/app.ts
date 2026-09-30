import { Component } from '@angular/core';
import { CardsList } from './features/cards/cards-list/cards-list';

@Component({
  selector: 'app-root',
  imports: [CardsList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}