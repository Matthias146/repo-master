import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-datenschutz',
  imports: [RouterLink],
  templateUrl: './datenschutz.html',
  styleUrl: './datenschutz.scss',
})
export class Datenschutz {
  today = new Date().toLocaleDateString('de-DE');
}
