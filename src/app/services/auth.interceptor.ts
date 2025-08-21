import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Agar login API hai toh token na bhejein
  if (req.url.includes('auth/userlogin')) {
    return next(req);
  }

  const token = localStorage.getItem('authToken');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};