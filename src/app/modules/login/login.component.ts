import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRequest, LoginResponse } from '../../models/login.model';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { MenuItem } from '../../models/menu.model';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  loginResponse: LoginResponse | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastrService,
    private menuService: MenuService,

  ) { }

  ngonit(
  ) {

  }
  onLogin() {
    localStorage.removeItem('authToken');
    this.error = '';
    if (!this.username || !this.password) {
      this.toast.warning('Enter username or password');
      return;
    }
    this.loading = true;
    const loginData: LoginRequest = {
      userName: this.username,
      password: this.password
    };
    this.apiService.post<LoginResponse>('auth/userlogin', loginData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.token != null) {
          this.toast.success('Login Successfully');
          localStorage.setItem('authToken', response.token);
          //localStorage.setItem('mCompanyGuid', response.mCompanyGuid);
          localStorage.setItem('userId', response.userId.toString());
          localStorage.setItem('userName', response.userName);
          localStorage.setItem('isSuperAdmin', response.isSuperAdmin.toString());
          localStorage.setItem('isAdmin', response.isAdmin.toString());
          //this.userContext.setUser(response.userId, response.userName, response.mCompanyGuid);
          this.fetchMenuDetails();
          this.router.navigate(['/dashboard']);
          return;
        } else {
          this.toast.warning(response.message || 'Login failed');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toast.warning('Invalid username or password');
        console.error('Login error:', error);
      },
    });
  }

  fetchMenuDetails() {
    const menureqdata: CommonReqDto<number> = {
      //mCompanyGuid: localStorage.getItem('mCompanyGuid') || '',
      //companyGuid: localStorage.getItem('mCompanyGuid') || '',
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : 0,
      Data: null,
    };

    this.apiService.post<CommonResDto<MenuItem[]>>('Menu/GetUserMenuListService', menureqdata).subscribe(res => {
      if (res) {
        const menuTree = this.buildMenuTree(res.data);
        console.log('Menu Tree:', menuTree);
        this.menuService.setMenu(menuTree);
      }
      this.router.navigate(['/dashboard']);
    });
  }

  buildMenuTree(flatMenu: MenuItem[]): MenuItem[] {
    const menuMap = new Map<number, MenuItem>();
    const roots: MenuItem[] = [];

    flatMenu.forEach(item => {
      menuMap.set(item.menuId, { ...item, children: [] });
    });

    flatMenu.forEach(item => {
      if (item.parentId === -1) {
        roots.push(menuMap.get(item.menuId)!);
      } else {
        const parent = menuMap.get(item.parentId);
        if (parent) {
          parent.children!.push(menuMap.get(item.menuId)!);
        }
      }
    });
    return roots;
  }

}
