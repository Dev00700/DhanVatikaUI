import { BaseDto } from "./base.model";
import { PlotAndCustomerEmiResDto } from "./customerinstallment.model";

export interface PlotBookingReqDto extends BaseDto {
    bookingGuid: string | null;
    bookingId: number;
    customerId: number;
    plotId: number;
    customerName?: string;
    occupation?: string;
    dateOfBirth?: Date;
    anniversary?: Date;
    contactNo1?: string;
    contactNo2?: string;
    postalAddress?: string;
    emailAddress?: string;
    referenceName1?: string;
    referenceContact1?: string;
    referenceName2?: string;
    referenceContact2?: string;
    city?: string;
    pinCode?: string;
    state?: string;
    nomineeName?: string;
    nomineeAddress?: string;
    nomineePhoneNo?: string;
    nomineeRelation?: string;
    nomineeAge?: number;
    projectName?: string;
    block?: string;
    plotCity?: string;
    khasraNo?: string;
    plotNo?: string;
    plotSize?: string;
    areaSqFt?: number;
    ratePerSqFt?: number;
    totalCost?: number;
    bookingDate?: Date;
    tokenAmount?: number;
    downPaymentDate?: Date;
    downPaymentAmount?: number;
    numberOfInstallments?: number;
    emiAmount?: number;
    executiveId?: string;
    executiveName?: string;
    executiveSignature?: string;
    purchaserName?: string;
    purchaserSign?: string;
    authorizedSignatory?: string;
    directorSalesDate?: Date;
    directorName?: string;
    directorSign?: string;
    panCardNumber?: string;
    drivingLicenseNumber?: string;
    passportNumber?: string;
    voterIdNumber?: string;
    aadhaarNumber?: string;
    rationCardNumber?: string;
    panCardImage?: string;
    drivingLicenseImage?: string;
    passportImage?: string;
    voterIdImage?: string;
    aadhaarImage?: string;
    rationCardImage?: string;
    customerPlotPaymentList?: PlotBookingPaymentDto[];
    plot_Code: string;
    subPlotCode: string;

}

export interface PlotBookingResDto extends BaseDto {
    customerId: number;
    plotId: number;
    customerName: string;
    plotCode: string;
    plot_Code: string;
    subPlotCode: string;
    plotName: string;
    totalAmt: number;
    paidAmt: number;
    balanceAmt: number;
}

export interface PlotBookingPaymentDto {
    customerpaymentid: number;
    emiNo: number;
    amount: number;
    paidAmount: number;
    emidate: Date;
    ispaid: boolean;
    remarks: string;
    dueAmount: number;
    previousDue: number;
    newRemarks: string;
    isRejected: boolean;
}