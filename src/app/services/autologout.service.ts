import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService {
  private timeoutId: any;
  private readonly TIMEOUT = 15 * 60 * 1000; // 15 minutes

  constructor(private router: Router, private ngZone: NgZone) {
    this.initListeners();
    this.resetTimer();
  }

  private initListeners(): void {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event =>
      document.addEventListener(event, () => this.resetTimer())
    );
  }

  private resetTimer(): void {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.logout(), this.TIMEOUT);
  }

  private logout(): void {
    sessionStorage.clear(); // Clear session
    alert('Session expired due to inactivity!');
    this.ngZone.run(() => this.router.navigate(['/login'])); // Redirect to login
  }
}