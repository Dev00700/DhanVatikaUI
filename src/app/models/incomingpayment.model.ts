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
    customerName?: string | "";
    image?: string | null;
    imageUrl?: string | null;
    isDisabled?: boolean | false;
    paymentSourceName?: string | null;
    paymentMode?: string | null;
    approveStatus: number | 0;
    approveStatusF: number | 0;
    PlotId?: number | 0;
    plotStatus?: number | 0;
    plotCode?: string | null;
    plot_Code?: string | null;
    subPlotCode?: string | null;
    plotName?: string | null;
    plotStatusName?: number | null;
    customerPaymentId?: number | 0;
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
    plot_Code?: string | null;
    subPlotCode?: string | null;
    customerName?: string | null;
    plotName?: string | null;
    receiptFlag?: boolean;
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

export enum PlotStatus {
    Select = 0,
    Available = 1,
    PreBooked = 2,
    Booked = 3,
    Sale = 4,
    Registry = 5,
    Hold = 6
}


export interface IncomingPaymentExcelDto extends BaseDto {
    customerName: string;
    plotCode: string;
    plotName: string;
    plotStatus: number;
    amount: number;
    paymentType: string;
    paymentMode: string;
    paymentSource: number;
    paymentSourceName: string;
    paymentDate: Date;
    referenceNo: string;
    bankName: string;
    branchName: string;
    adminApproveDate: string;
    adminApproveRemarks: string;
    superAdminName?: string;
    superAdminApproveDate?: string;
    superAdminApprover?: string;
    superAdminApproveRemarks?: string;
    adminApprover?: string | null;
    plotStatusName?: string | null;
}




// export interface IncomingPaymentFilterReqDto {
//     PaymentType?: string | null,
//     PaymentModeId?: number | null,
//     PaymentSource?: number | null,
//     PaymentDate?: string | null,
//     Year?: string | "0",
//     Month?: string | null
// }