import { BaseDto } from "./base.model";

export interface AddIncomingPaymentDto extends BaseDto {
    iPaymentGuid: string | null;
    paymentType: string;
    paymentModeId: number | 0;
    amount: number;
    paymentSource: number | 0;
    paymentDate: string;
    referenceNo?: string | "";
    bankName?: string | "";
    branchName?: string | "";
    customerId?: number | 0;
    image?: string | null;
    imageUrl?: string | null;
    isDisabled?: boolean | false;
}


export interface IncomingPaymentDto extends BaseDto {
    iPaymentGuid: string;
    paymentType: string;
    paymentModeId: number;
    amount: number;
    paymentSource: number;
    paymentDate: Date;
    referenceNo: string;
    bankName: string;
    branchName: string;
    paymentMode: string;
    paymentSourceName: string;
    approveStatus: number;
    approveStatusF: number;
    adminApprover?: string;
    adminName?: string;
    adminApproveDate?: string;
    adminApproveRemarks?: string;
    superAdminApprover?: string;
    superAdminName?: string;
    superAdminApproveDate?: string;
    superAdminApproveRemarks?: string;
    image?: string | null;
}

export interface ApproveIncommingPaymentReqDto {
    iPaymentGuid: string;
    approveStatus: number;
    approveRemarks: string;
}

export interface CancelIncomingPaymentReqDto {
    IPaymentGuid: string
    remarks: string
}

export interface IIncommingPaymentReqDto {
    IPaymentGuid: string,
    PaymentType?: string,
    PaymentModeId?: number,
    PaymentSource?: number,
    PaymentDate?: Date,
    Year?: number | 0,
    Month?: number
}

// export interface IncomingPaymentFilterReqDto {
//     PaymentType?: string | null,
//     PaymentModeId?: number | null,
//     PaymentSource?: number | null,
//     PaymentDate?: string | null,
//     Year?: string | "0",
//     Month?: string | null
// }