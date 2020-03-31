export interface IProblem {
    location: IRange;
    severity: ProblemSeverity;
    code?: ErrorCode;
    message: string;
}
export interface IRange {
    start: number;
    end: number;
}
export declare enum ProblemSeverity {
    Error = 0,
    Warning = 1
}
export declare enum ErrorCode {
    Undefined = 0,
    EnumValueMismatch = 1,
    CommentsNotAllowed = 2
}
export declare class ValidationResult {
    problems: IProblem[];
    propertiesMatches: number;
    propertiesValueMatches: number;
    primaryValueMatches: number;
    enumValueMatch: boolean;
    enumValues: any[];
    warnings: any[];
    errors: any[];
    constructor();
    hasProblems(): boolean;
    mergeAll(validationResults: ValidationResult[]): void;
    merge(validationResult: ValidationResult): void;
    mergeEnumValues(validationResult: ValidationResult): void;
    mergePropertyMatch(propertyValidationResult: ValidationResult): void;
    compareGeneric(other: ValidationResult): number;
}
