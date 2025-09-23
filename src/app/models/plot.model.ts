import { BaseDto } from "./base.model";

export interface PlotResponseDto{
    plotGuid : string;
    plotCode : string;
    plotName : string;
    description : string;
    locationId:number;
    locationName:string;
    address:string;
    latitude:string;
    longitude:string;
    areaSize:number;
    unitTypeId:string;
    unitTypeName:string;
    price:number;
    statusId:number;
    facing:string;
    plotType:string;
    nearbyLandmarks:string;
    plotStatus:string;
}

export interface PlotRequestDto extends BaseDto{
    plotCode : string | null;
    plotName : string;
    description : string;
    locationId:number;
    address:string;
    latitude:string;
    longitude:string;
    areaSize:number;
    unitTypeId:number;
    price:number;
    status:number;
    facing:string;
    plotType:string;
    nearbyLandmarks :string;
}