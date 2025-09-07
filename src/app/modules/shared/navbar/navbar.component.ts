import { AfterViewInit, Component } from '@angular/core';
import { MenuItem } from '../../../models/menu.model';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../../../services/menu.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements AfterViewInit { 
openMenus: number[] = [];
  
  async ngAfterViewInit() {
  try {
    await this.loadScript('assets/libs/bootstrap/js/bootstrap.bundle.min.js');
    await this.loadScript('assets/libs/node-waves/waves.min.js');
    await this.loadScript('assets/js/sticky.js');
    await this.loadScript('assets/libs/simplebar/simplebar.min.js');
    await this.loadScript('assets/js/simplebar.js');
    await this.loadScript('assets/libs/%40tarekraafat/autocomplete.js/autoComplete.min.js');
    await this.loadScript('assets/libs/%40simonwep/pickr/pickr.es5.min.js');
    await this.loadScript('assets/libs/flatpickr/flatpickr.min.js');
    // await this.loadScript('assets/libs/apexcharts/apexcharts.min.js');
    // await this.loadScript('assets/js/ecommerce-dashboard.js');
    await this.loadScript('assets/js/custom.js');
    await this.loadScript('assets/js/custom-switcher.min.js');

    console.log('All navbar scripts loaded ✅');
  } catch (err) {
    console.error(err);
  }
}

   menuTree: MenuItem[] = [];
  //  openMenus: number[] = [];
  constructor( 
    private router: Router,
    private menuService: MenuService, ) {  }

    ngOnInit() {
      this.menuService.menu$.subscribe(menu => {
      this.menuTree = menu;
    });
    this.menuService.loadMenuFromStorage();
  }

toggleMenu(index: number) {
  debugger;
  if (this.openMenus.includes(index)) {
    this.openMenus = this.openMenus.filter(i => i !== index);
  } else {
    this.openMenus.push(index);
  }
}


private loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(); // already loaded
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(`Script load error: ${src}`);
    document.body.appendChild(script);
  });
}


}
