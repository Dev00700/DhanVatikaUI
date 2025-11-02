import { BaseDto } from "./base.model";

export interface LocationReqDto extends BaseDto {
    locationGuid: string | null;
    locationName: string;
    image: string | null;
    locationId?: number | null;
    imageUrl?: string | null;
}

export interface LocationResDto extends BaseDto {
    locationGuid: string | null;
    locationName: string;
    image: string | null;
    locationId?: number | null;
    imageUrl?: string | null;
}