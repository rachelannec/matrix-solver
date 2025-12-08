export interface Matrix {
    data: number[][];
    rows: number;
    cols: number;
}

export interface Step {
    description: string;
    matrix: number[][];
    highlightedRows?: number[];
    operation?: string;
}

export type OperationType = 
    | 'gaussian-elimination'
    | 'gauss-jordan'
    | 'determinant'
    | 'inverse'
    | 'rref';

export interface SolutionResult {
    finalMatrix: number[][];
    solution?: number[];
    determinant?: number;
    rank?: number;
}