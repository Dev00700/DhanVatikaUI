export interface EnquiryResponeDto {
    enquiryGuid: string;
    plotId: number;
    plotCode: string;
    plot_Code: string;
    subPlotCode: string;
    plotName: string;
    locationName: string;
    name: string;
    email: string;
    mobile: string;
    plotType: string;
    areaSize: number;
    amount: number;
    date: Date;
    enquiryId: number;
    isCustomer: number;

}

export interface ClosedEnquiryReqDto {
    enquiryGuid: string;
    remarks: string;
}
