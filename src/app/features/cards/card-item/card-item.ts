import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Card } from '../../../core/models/card.model';

@Component({
  selector: 'app-card-item',
  imports: [DatePipe, RouterLink],
  templateUrl: './card-item.html',
  styleUrl: './card-item.scss'
})
export class CardItem {
  readonly card = input.required<Card>();
  readonly fixado = input<boolean>(false);
}