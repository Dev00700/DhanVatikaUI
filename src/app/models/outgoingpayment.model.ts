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