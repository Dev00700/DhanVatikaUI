import { BaseDto } from "./base.model";

export interface UserRegistrtionDto extends BaseDto{
  userGuid : string | null;
  userId:number | 0;
  userCode: string | null;
  userName:string | null;
  email: string | null;
  mobileNo:string | null;
  password:string | null;
  roleId: number | 0;
  status : string | null;
} 

export interface UserDto{
  userGuid : string | null;
}