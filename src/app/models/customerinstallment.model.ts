export interface PlotAndCustomerEmiResDto {
    customerPaymentId: number;
    customerId: number;
    plotId: number;
    emiNo: number;
    amount: number;
    paidAmount: number;
    emiDate: Date;
    isPaid: boolean
    remarks: string;
    customerName: string;
    mobile: string;
    emailId: string;
    plotName: string;
    plotCode: string;
    plot_Code: string;
    subPlotCode: string;
    dueAmount: number;
    previousDue: number;
    totalPendingAmount: number;
    isrejected: boolean;
    newremarks: string;
    receiptFlag: boolean;
    iPaymentGuid: string;
    paymentDate: string;

}