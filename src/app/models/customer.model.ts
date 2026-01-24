import { BaseDto } from "./base.model";

export interface customerListResponseDto {
    customerGuid: string;
    customerId: number;
    enquiryId: number;
    name: string;
    emailId: string;
    mobile: string;
    plotId: number;
    plotName: string;
    bookingFlag: number;
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
    bookingFlag: number | 0;
    plotName?: string | null;
    customerPlotId?: number | null;
}