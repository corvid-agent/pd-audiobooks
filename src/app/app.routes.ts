import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    title: 'PD Audiobooks — Free Public Domain Audiobooks',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'browse',
    title: 'Browse Audiobooks — PD Audiobooks',
    loadComponent: () => import('./features/browse/browse.component').then((m) => m.BrowseComponent),
  },
  {
    path: 'audiobook/:id',
    title: 'Audiobook Details — PD Audiobooks',
    loadComponent: () => import('./features/audiobook/audiobook.component').then((m) => m.AudiobookComponent),
  },
  {
    path: 'library',
    title: 'My Library — PD Audiobooks',
    loadComponent: () => import('./features/library/library.component').then((m) => m.LibraryComponent),
  },
  {
    path: 'author/:id',
    title: 'Author — PD Audiobooks',
    loadComponent: () => import('./features/author/author.component').then((m) => m.AuthorComponent),
  },
  {
    path: 'genre/:name',
    title: 'Genre — PD Audiobooks',
    loadComponent: () => import('./features/genre/genre.component').then((m) => m.GenreComponent),
  },
  {
    path: 'stats',
    title: 'Listening Stats — PD Audiobooks',
    loadComponent: () => import('./features/stats/stats.component').then((m) => m.StatsComponent),
  },
  {
    path: 'about',
    title: 'About — PD Audiobooks',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: '**',
    title: 'Page Not Found — PD Audiobooks',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
