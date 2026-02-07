import { BaseDto } from "./base.model";

export interface AddOutgoingPaymentDto extends BaseDto {
    oPaymentGuid: string | null;
    expenseTitle: string;
    paymentModeId: number | 0;
    expenseCategoryId: number | 0;
    amount: number;
    expenseDate: string;
    referenceNo?: string | "";
    partyName?: string | "";
    image?: string | null;
    imageUrl?: string | null;
    isDisabled?: boolean | false;
    expenseCategoryName?: string | null;
    paymentMode?: string | null;
    approveStatus: number | 0;
    approveStatusF: number | 0;
    plotId: number | 0;
    plotCode?: string | null;
}


export interface OutgoingPaymentDto extends BaseDto {
    oPaymentGuid: string;
    paymentType: string;
    paymentModeId: number;
    amount: number;
    expenseCategoryName: string;
    expenseDate: Date;
    referenceNo: string;
    paymentMode: string;
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
    plotCode?: string | null;
}

export interface ApproveOutgoingPaymentReqDto {
    OPaymentGuid: string;
    approveStatus: number;
    approveRemarks: string;
}

export interface CancelOutgoingPaymentReqDto {
    OPaymentGuid: string
    remarks: string
}

export interface OutgoingPaymentReqDto {
    IPaymentGuid: string,
    PaymentType?: string,
    PaymentModeId?: number,
    PaymentSource?: number,
    PaymentDate?: Date,
    Year?: number | 0,
    Month?: number
}