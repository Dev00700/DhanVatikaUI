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
  fullpageloader:boolean= false;
  userlist: UserList[] = [];
  selectedUser: UserList | null = null;
  selectedMenus: string[] = []; // menu ids ya names
  menuList: any[] = [];
  expandedRow: number | null = null;
  isViewAll: boolean = false;
  pageSize = 1;
  pageRecordCount = 10;
  totalCount = 0;

  constructor(
     private router: RouterModule,
     private apiService: ApiService,
     private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.getUserList();
    //this.getMenuList();
  }
  getUserList(){
    this.fullpageloader = true;
    const reqData: CommonReqDto<string>= {
           PageSize:this.isViewAll ? 1  :this.pageSize,
            PageRecordCount: this.isViewAll ? this.totalCount|| 99999:  this.pageRecordCount,
            Data:null,
            UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    };
    this.apiService.post<CommonResDto<UserList[]>>('User/GetUserListService', reqData).subscribe({
      next: (res: any) => {
        this.userlist = res.data;
        this.pageSize= res.pageSize;
        this.pageRecordCount= res.pageRecordCount;
        this.totalCount= res.totalRecordCount;
        this.fullpageloader = false;
      },
      error: (err: any) => {
        this.toastr.error('Failed to fetch user list', 'Error');
        this.fullpageloader = false;
      }
    });
  }

   getMenuList(user:UserList){
    this.fullpageloader = true;
    const reqData: CommonReqDto<string>= {
            PageSize: 1,
            PageRecordCount: 1000,
            Data:null,
            UserId: user.userId,
    };
    this.apiService.post<CommonResDto<MenuItem[]>>('Menu/GetUserMenuForUpdateService', reqData).subscribe({
      next: (res: any) => {
       const menuTree = this.buildMenuTree(res.data);
        this.menuList = menuTree;
        
        this.fullpageloader = false;
      },
      error: (err: any) => {
        this.toastr.error('Failed to fetch menu list', 'Error');
        this.fullpageloader = false;
      }
    });
  }

 

saveUserMenus() {
  this.loading= true;
    const dataArr =[] as any[];
    const collectChecked = (menus: any[]) => {
    menus.forEach(menu => {
      if (menu.checked) {
        dataArr.push({
          UserId: (this.selectedUser?.userId || 0),
          MenuId: menu.menuId,
          IsActive: true
        });
      }
      else if (!menu.checked){
         dataArr.push({
          UserId: (this.selectedUser?.userId || 0),
          MenuId: menu.menuId,
          IsActive: false
        });
      }
      if (menu.children?.length) {
        collectChecked(menu.children);
      }
    });
  };
  collectChecked(this.menuList);

  const reqData: CommonReqDto<UserMenuAddReqDto[]> = {
    PageSize:1,  
    PageRecordCount: 10,  
    Data: dataArr || null,
    UserId: parseInt(localStorage.getItem("userId") || '0', 10),
  };
  this.apiService.post<CommonResDto<any>>('Menu/AddMenuService', reqData).subscribe({
    next: () => {
      this.toastr.success('Menus assigned successfully');
      this.loading=false;
      this.selectedUser = null;
    },
    error: () => {
      this.toastr.error('Failed to assign menus');
      this.loading=false;
    }
  });
}

  openAssignMenu(user: UserList) {
  this.selectedUser = user;
  this.selectedMenus = []; 

  this.getMenuList(user);
  }
toggleMenu(menu: any, parent?: any) {
  menu.checked = !menu.checked;

  // If menu has children, recursively select/deselect all children
  if (menu.children?.length) {
    this.toggleChildren(menu.children, menu.checked);
  }

  // If child clicked, check if all siblings are selected, then select parent
  if (parent) {
    const allSelected = parent.children.every((child: any) => child.checked);
    parent.checked = allSelected;
  }
}

// Recursive function to select/deselect all children
toggleChildren(children: any[], checked: boolean) {
  children.forEach(child => {
    child.checked = checked;
    if (child.children?.length) {
      this.toggleChildren(child.children, checked);
    }
  });
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

    
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageRecordCount);
  }

  nextPage() {
    if (this.pageSize < this.totalPages) {
      this.pageSize++;
      this.getUserList();
    }
  }
   prevPage() {
    if (this.pageSize > 1) {
      this.pageSize--;
      this.getUserList();
    }
  }

  getStartIndex(): number {
  return (this.pageSize - 1) * this.pageRecordCount;
}

getEndIndex(): number {
  const end = this.getStartIndex() + this.pageRecordCount;
  return end > this.totalCount ? this.totalCount : end;
}
viewAll() {
  this.isViewAll = true;
  this.pageSize = 1;
  this.getUserList();
}
viewLess() {
  this.isViewAll = false;
  this.pageSize = 1;
  this.pageRecordCount=1;
  this.getUserList();
}
}



 
