export interface BaseDto{
    isActive: boolean;
    createdOn: Date | null;
    createdBy: number | null;
    modifiedOn: Date | null;
    modifiedBy: number | null;
    delMark: boolean;
    remarks: string | null;
}