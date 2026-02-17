import { HttpInterceptorFn } from '@angular/common/http';

export const librivoxInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('librivox.org/api')) {
    const url = new URL(req.url);
    if (!url.searchParams.has('format')) {
      url.searchParams.set('format', 'json');
    }
    const cloned = req.clone({
      url: url.toString(),
      setHeaders: {
        Accept: 'application/json',
      },
    });
    return next(cloned);
  }
  return next(req);
};
