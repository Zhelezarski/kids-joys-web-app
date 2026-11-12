import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AdminApi } from './services/admin-api';

const adminGuard: CanActivateFn = async () => {
  const api = inject(AdminApi);
  const router = inject(Router);
  return (await api.seja()) && (await api.jeAdmin()) ? true : router.createUrlTree(['/admin/prijava']);
};

export const routes: Routes = [
  { path: 'admin/prijava', title: 'Prijava | Kids Joy admin', loadComponent: () => import('./admin/prijava/prijava').then((m) => m.Prijava) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/postavitev/postavitev').then((m) => m.AdminPostavitev),
    children: [
      { path: '', title: 'Pregled | Kids Joy admin', loadComponent: () => import('./admin/pregled/pregled').then((m) => m.Pregled) },
      { path: 'rezervacije', title: 'Rezervacije | Kids Joy admin', loadComponent: () => import('./admin/rezervacije/rezervacije').then((m) => m.AdminRezervacije) },
      { path: 'ponudba', title: 'Igrala in dekoracije | Kids Joy admin', loadComponent: () => import('./admin/ponudba/ponudba').then((m) => m.AdminPonudba) },
      { path: 'ponudba/nova', title: 'Nova ponudba | Kids Joy admin', loadComponent: () => import('./admin/ponudba-uredi/ponudba-uredi').then((m) => m.PonudbaUredi) },
      { path: 'ponudba/:id', title: 'Urejanje | Kids Joy admin', loadComponent: () => import('./admin/ponudba-uredi/ponudba-uredi').then((m) => m.PonudbaUredi) },
      { path: 'nastavitve', title: 'Nastavitve | Kids Joy admin', loadComponent: () => import('./admin/nastavitve/nastavitve').then((m) => m.AdminNastavitve) },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./javna-postavitev').then((m) => m.JavnaPostavitev),
    children: [
      { path: '', title: 'Kids Joy | Napihljiva igrala in dekoracije', loadComponent: () => import('./pages/domov/domov').then((m) => m.Domov) },
      { path: 'igrala', title: 'Igrala | Kids Joy', loadComponent: () => import('./pages/igrala/igrala').then((m) => m.Igrala) },
      { path: 'igrala/:id', title: 'Igralo | Kids Joy', loadComponent: () => import('./pages/igralo/igralo').then((m) => m.Igralo) },
      { path: 'dekoracije', title: 'Dekoracije z baloni | Kids Joy', loadComponent: () => import('./pages/dekoracije/dekoracije').then((m) => m.Dekoracije) },
      { path: 'dekoracije/:id', title: 'Dekoracija | Kids Joy', loadComponent: () => import('./pages/igralo/igralo').then((m) => m.Igralo) },
      { path: 'rezervacija', title: 'Rezervacija | Kids Joy', loadComponent: () => import('./pages/rezervacija/rezervacija').then((m) => m.Rezervacija) },
      { path: 'zasebnost', title: 'Politika zasebnosti | Kids Joy', loadComponent: () => import('./pages/pravno/zasebnost').then((m) => m.Zasebnost) },
      { path: 'pogoji', title: 'Splošni pogoji najema | Kids Joy', loadComponent: () => import('./pages/pravno/pogoji').then((m) => m.Pogoji) },
      { path: 'kontakt', title: 'Kontakt in pogosta vprašanja | Kids Joy', loadComponent: () => import('./pages/kontakt/kontakt').then((m) => m.Kontakt) },
    ],
  },
  { path: '**', redirectTo: '' },
];
