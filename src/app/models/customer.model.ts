import { BaseDto } from "./base.model";

export interface customerListResponseDto {
    customerGuid: string;
    customerId: number;
    enquiryId: number;
    name: string;
    emailId: string;
    mobile: string;
    pLotList: customerplotListResponseDto[];
}

export interface customerplotListResponseDto {
    plotId: number;
    plotCode: string;
    subPlotCode: string;
    customerId: number;
    plotName: string;
    bookingFlag: number;
    plotStatus: number
    isTokenAmount: boolean
}

export interface addcustomerRequestDto extends BaseDto {
    customerGuid: string | null;
    customerId: number;
    enquiryId: number;
    name: string;
    emailId: string;
    mobile: string;
    plotId: number;
    image: string | null;
    imageUrl?: string | null;
    pLotList: customerplotListResponseDto[] | null;
}

export interface CustomerPlotCancelReqDto {
    customerId: number;
    plotId: number;
    remarks: string
}

export interface AddMultiplePlotReqDto {
    customerId: number;
    plotId: number;
    flag: number; // 1 for add,2 for remove
}

