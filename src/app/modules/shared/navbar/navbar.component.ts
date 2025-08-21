import { Component } from '@angular/core';
import { RouterLink } from "../../../../../node_modules/@angular/router/router_module.d-Bx9ArA6K";
declare function menu_click(): void;
declare function LoadEvent(): void;
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
ngAfterViewInit() {
    menu_click(); // Re-initialize menu JS after view loads
    LoadEvent(); // Set layout after view loads
  }
}
