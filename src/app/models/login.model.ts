export interface LoginRequest {
    userName: string;
    password: string;
}

export interface LoginResponse {
    userguid: string,
    userId:number,
    userCode: string,
    userName:string,
    email: string,
    mobileNo:string,
    token:string,
    companyCount: number,
    isSingleUser: boolean,
    mCompanyGuid: string,
    companyGuid:string
    message?: string
}