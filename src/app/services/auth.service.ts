// src/app/service/auth.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('authToken'); 
    this.router.navigate(['/login']); 
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken'); 
  }
}
