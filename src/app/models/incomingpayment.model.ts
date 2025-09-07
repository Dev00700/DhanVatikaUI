import { BaseDto } from "./base.model";

export interface AddIncomingPaymentDto extends BaseDto {
    iPaymentGuid: string | null;
    paymentType: string;
    paymentModeId: number | 0;
    amount: number;
    paymentSource:number | 0;
    paymentDate:Date;
    referenceNo?: string | "";
    bankName? :string | "";
    branchName?:string | "";
    customerId?: number | 0;
    image?: string | null;
}


export interface IncomingPaymentDto extends BaseDto {
    iPaymentGuid:string;
    paymentType: string;
    paymentModeId: number;
    amount: number;
    paymentSource:number;
    paymentDate:Date;
    referenceNo: string;
    bankName :string;
    branchName:string;
    paymentMode:string;
    paymentSourceName:string;
}