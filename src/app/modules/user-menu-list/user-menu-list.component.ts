import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserList } from '../../models/usermenu.model';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { MenuItem, UserMenuAddReqDto } from '../../models/menu.model';

@Component({
  selector: 'app-user-menu-list',
  imports: [CommonModule,NavbarComponent,RouterModule,FooterComponent],
  templateUrl: './user-menu-list.component.html',
  styleUrl: './user-menu-list.component.css'
})
export class UserMenuListComponent {
  loading: boolean = false;
  userlist: UserList[] = [];
  selectedUser: UserList | null = null;
  selectedMenus: string[] = []; // menu ids ya names
  menuList: any[] = [];
  expandedRow: number | null = null;

  constructor(
     private router: RouterModule,
     private apiService: ApiService,
     private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.getUserList();
    this.getMenuList();
  }
  getUserList(){
    this.loading = true;
    const reqData: CommonReqDto<string>= {
            PageSize: 1,
            PageRecordCount: 1000,
            Data:null,
            UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    };
    this.apiService.post<CommonResDto<UserList[]>>('User/GetUserListService', reqData).subscribe({
      next: (res: any) => {
       debugger;
        this.userlist = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        this.toastr.error('Failed to fetch user list', 'Error');
        this.loading = false;
      }
    });
  }

   getMenuList(){
    debugger;
    this.loading = true;
    const reqData: CommonReqDto<string>= {
            PageSize: 1,
            PageRecordCount: 1000,
            Data:null,
            UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    };
    this.apiService.post<CommonResDto<MenuItem[]>>('Menu/GetMenuListService', reqData).subscribe({
      next: (res: any) => {
        debugger;
       const menuTree = this.buildMenuTree(res.data);
        this.menuList = menuTree;
        this.loading = false;
      },
      error: (err: any) => {
        this.toastr.error('Failed to fetch menu list', 'Error');
        this.loading = false;
      }
    });
  }

  saveUserMenus() {

   const dataArr = this.selectedMenus.map(menuId => ({
  UserId: (this.selectedUser?.userId || 0),
  MenuId: parseInt(menuId, 10),
  IsActive: true
}));
const reqData: CommonReqDto<UserMenuAddReqDto[]> = {
  PageSize:1,  
  PageRecordCount: 10,  
  Data: dataArr || null,
  UserId: parseInt(localStorage.getItem("userId") || '0', 10),
};
debugger;
  this.apiService.post<CommonResDto<any>>('Menu/AddMenuService', reqData).subscribe({
    next: () => {
      this.toastr.success('Menus assigned successfully');
      this.selectedUser = null;
    },
    error: () => {
      this.toastr.error('Failed to assign menus');
    }
  });
}

  openAssignMenu(user: UserList) {
  this.selectedUser = user;
  this.selectedMenus = []; 
  }
toggleMenu(menu: any, parent?: any) {
  const isChecked = this.selectedMenus.includes(menu.menuId);
  this.setChecked(menu.menuId, !isChecked);

  // If menu has children, recursively select/deselect all children
  if (menu.children?.length) {
    this.toggleChildren(menu.children, !isChecked);
  }

  // If child clicked, check if all siblings are selected, then select parent
  if (parent) {
    const allSelected = parent.children.every((child: any) => this.selectedMenus.includes(child.menuId));
    this.setChecked(parent.menuId, allSelected);
  }
}

// Recursive function to select/deselect all children
toggleChildren(children: any[], checked: boolean) {
  children.forEach(child => {
    this.setChecked(child.menuId, checked);
    if (child.children?.length) {
      this.toggleChildren(child.children, checked);
    }
  });
}

setChecked(menuId: string, checked: boolean) {
  if (checked) {
    if (!this.selectedMenus.includes(menuId)) this.selectedMenus.push(menuId);
  } else {
    this.selectedMenus = this.selectedMenus.filter(id => id !== menuId);
  }
}

buildMenuTree(flatMenu: MenuItem[]): MenuItem[] {
    const menuMap = new Map<number, MenuItem>();
    const roots: MenuItem[] = [];

    flatMenu.forEach(item => {
      menuMap.set(item.menuId, { ...item, children: [] });
    });

    flatMenu.forEach(item => {
      if (item.parentId ===0 || item.parentId=== -1) {
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

 
