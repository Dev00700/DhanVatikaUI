export interface MenuItem {
  menuGuid: string;
  menuId: number;
  menuName: string;
  url: string;
  icon: string;
  menuCode: string;
  parentId: number;
  checked?:boolean;
  children?: MenuItem[]; // For nested menu structure
}

export interface UserMenuAddReqDto{
  UserId: number;
  MenuId:number;
  IsActive:boolean;
}