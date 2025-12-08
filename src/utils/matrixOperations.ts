import type { Step, SolutionResult } from '../types/matrix';

// Helper: Deep copy matrix
export const copyMatrix = (matrix: number[][]): number[][] => {
    return matrix.map(row => [...row]);
};

// Helper: Swap two rows
export const swapRows = (matrix: number[][], row1: number, row2: number): number[][] => {
    const result = copyMatrix(matrix);
    [result[row1], result[row2]] = [result[row2], result[row1]];
    return result;
};

// Helper: Multiply row by scalar
export const multiplyRow = (matrix: number[][], row: number, scalar: number): number[][] => {
    const result = copyMatrix(matrix);
    result[row] = result[row].map(val => val * scalar);
    return result;
};

// Helper: Add multiple of one row to another
export const addRows = (
    matrix: number[][], 
    targetRow: number, 
    sourceRow: number, 
    scalar: number
): number[][] => {
    const result = copyMatrix(matrix);
    for (let j = 0; j < result[targetRow].length; j++) {
        result[targetRow][j] += scalar * result[sourceRow][j];
    }
    return result;
};

// Gaussian Elimination with steps
export const gaussianElimination = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = copyMatrix(inputMatrix);
    const n = matrix.length;
    
    steps.push({
        description: 'Starting matrix',
        matrix: copyMatrix(matrix),
    });

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
                maxRow = k;
            }
        }

        // Swap rows if needed
        if (maxRow !== i) {
            matrix = swapRows(matrix, i, maxRow);
            steps.push({
                description: `Swap Row ${i + 1} with Row ${maxRow + 1}`,
                matrix: copyMatrix(matrix),
                highlightedRows: [i, maxRow],
                operation: 'swap'
            });
        }

        // Check for zero pivot
        if (Math.abs(matrix[i][i]) < 1e-10) {
            steps.push({
                description: `Pivot at position (${i + 1}, ${i + 1}) is zero. Matrix may be singular.`,
                matrix: copyMatrix(matrix),
                highlightedRows: [i]
            });
            continue;
        }

        // Make pivot = 1
        const pivot = matrix[i][i];
        if (Math.abs(pivot - 1) > 1e-10) {
            matrix = multiplyRow(matrix, i, 1 / pivot);
            steps.push({
                description: `Divide Row ${i + 1} by ${pivot.toFixed(3)}`,
                matrix: copyMatrix(matrix),
                highlightedRows: [i],
                operation: 'multiply'
            });
        }

        // Eliminate below pivot
        for (let k = i + 1; k < n; k++) {
            const factor = matrix[k][i];
            if (Math.abs(factor) > 1e-10) {
                matrix = addRows(matrix, k, i, -factor);
                steps.push({
                    description: `Row ${k + 1} = Row ${k + 1} - (${factor.toFixed(3)}) × Row ${i + 1}`,
                    matrix: copyMatrix(matrix),
                    highlightedRows: [i, k],
                    operation: 'add'
                });
            }
        }
    }

    // Back substitution
    const solution: number[] = new Array(n).fill(0);
    const cols = matrix[0].length;
    
    if (cols === n + 1) {
        // Augmented matrix - solve for variables
        for (let i = n - 1; i >= 0; i--) {
            solution[i] = matrix[i][cols - 1];
            for (let j = i + 1; j < n; j++) {
                solution[i] -= matrix[i][j] * solution[j];
            }
            solution[i] /= matrix[i][i];
        }
    }

    return {
        steps,
        result: {
            finalMatrix: matrix,
            solution: cols === n + 1 ? solution : undefined
        }
    };
};

// Calculate determinant using cofactor expansion
export const calculateDeterminant = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    const n = inputMatrix.length;

    steps.push({
        description: 'Calculating determinant',
        matrix: copyMatrix(inputMatrix),
    });

    const det = determinantRecursive(inputMatrix, steps);

    return {
        steps,
        result: {
            finalMatrix: inputMatrix,
            determinant: det
        }
    };
};

const determinantRecursive = (matrix: number[][], steps: Step[]): number => {
    const n = matrix.length;

    if (n === 1) return matrix[0][0];
    if (n === 2) {
        const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        steps.push({
            description: `2×2 determinant = (${matrix[0][0]} × ${matrix[1][1]}) - (${matrix[0][1]} × ${matrix[1][0]}) = ${det.toFixed(3)}`,
            matrix: copyMatrix(matrix)
        });
        return det;
    }

    let det = 0;
    for (let j = 0; j < n; j++) {
        const minor = getMinor(matrix, 0, j);
        const cofactor = Math.pow(-1, j) * matrix[0][j] * determinantRecursive(minor, steps);
        det += cofactor;
    }

    return det;
};

const getMinor = (matrix: number[][], row: number, col: number): number[][] => {
    return matrix
        .filter((_, i) => i !== row)
        .map(r => r.filter((_, j) => j !== col));
};