// menu.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private menuSubject = new BehaviorSubject<MenuItem[]>([]);
  menu$ = this.menuSubject.asObservable();

  setMenu(menu: MenuItem[]) {
    this.menuSubject.next(menu);
    localStorage.setItem('userMenu', JSON.stringify(menu));
  }

  loadMenuFromStorage() {
    const menu = localStorage.getItem('userMenu');
    if (menu) {
      this.menuSubject.next(JSON.parse(menu));
    }
  }
}