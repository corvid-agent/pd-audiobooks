import { HttpInterceptorFn } from '@angular/common/http';

const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';

export const librivoxInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('librivox.org/api')) {
    const url = new URL(req.url);
    if (!url.searchParams.has('format')) {
      url.searchParams.set('format', 'json');
    }
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url.toString())}`;
    const cloned = req.clone({
      url: proxiedUrl,
      setHeaders: {
        Accept: 'application/json',
      },
    });
    return next(cloned);
  }
  return next(req);
};
