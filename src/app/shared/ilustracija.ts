import { Component, computed, input } from '@angular/core';
import { Ponudba } from '../data';

/** Prikaže fotografijo, ali barvno ilustracijo, če fotografije še ni. */
@Component({
  selector: 'app-ilustracija',
  template: `
    @if (slika()) {
      <img [src]="slika()" [alt]="ponudba().ime" loading="lazy" />
    } @else {
      <svg viewBox="0 0 200 140" role="img" [attr.aria-label]="ponudba().ime">
        <rect width="200" height="140" [attr.fill]="ozadje()" />
        @switch (ponudba().oblika) {
          @case ('baloni') {
            <path d="M60 140 C 70 110, 90 100, 100 70" stroke="#999" fill="none" />
            <path d="M100 140 C 100 110, 110 95, 120 60" stroke="#999" fill="none" />
            <path d="M140 140 C 130 110, 120 100, 80 50" stroke="#999" fill="none" />
            <ellipse cx="100" cy="52" rx="22" ry="27" [attr.fill]="b()[0]" />
            <ellipse cx="128" cy="44" rx="20" ry="25" [attr.fill]="b()[1]" />
            <ellipse cx="74" cy="38" rx="20" ry="25" [attr.fill]="b()[2]" stroke="#0001" />
            <ellipse cx="92" cy="44" rx="5" ry="8" fill="#fff6" />
          }
          @default {
            <rect x="30" y="108" width="140" height="18" rx="6" [attr.fill]="b()[1]" />
            <rect x="40" y="58" width="120" height="52" rx="6" [attr.fill]="b()[0]" />
            <rect x="34" y="40" width="20" height="70" rx="8" [attr.fill]="b()[2]" />
            <rect x="146" y="40" width="20" height="70" rx="8" [attr.fill]="b()[2]" />
            <path d="M30 42 L44 18 L58 42 Z" [attr.fill]="b()[1]" />
            <path d="M142 42 L156 18 L170 42 Z" [attr.fill]="b()[1]" />
            <path d="M80 60 Q100 30 120 60 Z" [attr.fill]="b()[2]" />
            <rect x="72" y="72" width="56" height="34" rx="16" fill="#fff8" />
            @if (ponudba().oblika === 'tobogan' || ponudba().oblika === 'zogice') {
              <path d="M160 60 Q 190 90 196 126 L 176 126 Q 172 96 150 76 Z" [attr.fill]="b()[1]" />
            }
            @if (ponudba().oblika === 'zogice') {
              <circle cx="182" cy="122" r="5" fill="#e8412c" />
              <circle cx="192" cy="118" r="5" fill="#2f6fdb" />
              <circle cx="172" cy="120" r="5" fill="#f6c026" />
            }
          }
        }
      </svg>
    }
  `,
  styles: `
    :host { display: block; aspect-ratio: 10 / 7; overflow: hidden; background: var(--kremna); }
    img, svg { width: 100%; height: 100%; object-fit: cover; display: block; }
  `,
})
export class Ilustracija {
  ponudba = input.required<Ponudba>();
  slika = computed(() => this.ponudba().slike[0] ?? '');
  b = computed(() => this.ponudba().barve);
  ozadje = computed(() => (this.ponudba().oblika === 'baloni' ? '#fdf1f5' : '#e7f3ff'));
}
