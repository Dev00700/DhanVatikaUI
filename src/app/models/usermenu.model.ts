import { BaseDto } from "./base.model";

export interface UserList extends BaseDto{
    userId: number;
    userGuid: string;
    userCode:string;
    userName:string;
    email:string;
    mobileNo:string;
}