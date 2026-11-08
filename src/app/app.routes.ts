import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Kids Joy | Napihljiva igrala in dekoracije', loadComponent: () => import('./pages/domov/domov').then((m) => m.Domov) },
  { path: 'igrala', title: 'Igrala | Kids Joy', loadComponent: () => import('./pages/igrala/igrala').then((m) => m.Igrala) },
  { path: 'igrala/:id', title: 'Igralo | Kids Joy', loadComponent: () => import('./pages/igralo/igralo').then((m) => m.Igralo) },
  { path: 'dekoracije', title: 'Dekoracije z baloni | Kids Joy', loadComponent: () => import('./pages/dekoracije/dekoracije').then((m) => m.Dekoracije) },
  { path: 'rezervacija', title: 'Rezervacija | Kids Joy', loadComponent: () => import('./pages/rezervacija/rezervacija').then((m) => m.Rezervacija) },
  { path: 'kontakt', title: 'Kontakt in pogosta vprašanja | Kids Joy', loadComponent: () => import('./pages/kontakt/kontakt').then((m) => m.Kontakt) },
  { path: '**', redirectTo: '' },
];
