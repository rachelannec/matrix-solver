/**
 * MATRIX OPERATIONS - Core calculations
 * -----
 * This file constains all the mathematical operations for this project.
 * 
 * Key Concepts:
 * - never mutate the original matrix; always work on copies
 * - use tolerance (1e-10) to handle floating point precision issues
 * - each operation returns a new matrix copy
 * - steps are recorded for the visualization in the ui
 */ 


/** 
 * About Tolerance Constant
 * -----
 * 1e-10 means 0.0000000001 - any number smaller than this is treated as zero.
 * Why? SInce computers can't represent decimal numbers perfectly (e.g., 0.1 + 0.2 != 0.3 exactly),
 * This prevents tiny floating point errors from affecting our calculations.
*/

import type { Step, SolutionResult } from '../types/matrix';

// Helper Function: Deep copy matrix
// This is what we'll use to not ovewrite the original matrix
export const copyMatrix = (matrix: number[][]): number[][] => {
    return matrix.map(row => [...row]);
};

// Helper: Swap two rows
// MATH NOTATION: R₁ ↔ R₂
export const swapRows = (matrix: number[][], row1: number, row2: number): number[][] => {
    const result = copyMatrix(matrix);

    // js destructuring swap: [a, b] = [b, a]
    [result[row1], result[row2]] = [result[row2], result[row1]];
    return result;
};

// Helper: Multiply row by scalar
// MATH NOTATION: Rᵢ → k·Rᵢ
// use case: making pivot elements equal to 1
export const multiplyRow = (matrix: number[][], row: number, scalar: number): number[][] => {
    const result = copyMatrix(matrix);
    result[row] = result[row].map(val => val * scalar);
    return result;
};

// Helper: Add multiple of one row to another
// MATH NOTATION: Rᵢ → Rᵢ + k·Rⱼ
// use case: eliminating entries below/above pivots
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

// Helper: Round small numbers to zero
// why? after many operations, we might get tiny floating point  instead of 0
// this helps clean up the matrix for display
const cleanNumber = (num: number, tolerance: number = 1e-10): number => {
    return Math.abs(num) < tolerance ? 0 : num;
};

// Helper: Clean entire matrix
// applies cleanNumber to every element
const cleanMatrix = (matrix: number[][]): number[][] => {
    return matrix.map(row => row.map(val => cleanNumber(val)));
};

// -----
// MAIN OPERATIONS
// -----

/**
 * Gaussian Elimination (Row Echelon Form)
 */
export function gaussianElimination(inputMatrix: number[][]): { steps: Step[], result: SolutionResult } {
    const steps: Step[] = [];
    const matrix = inputMatrix.map(row => [...row]);
    const n = matrix.length;
    const m = matrix[0].length;
    
    steps.push({
        description: 'Initial augmented matrix',
        matrix: matrix.map(row => [...row]),
    });

    // Forward elimination with partial pivoting
    for (let col = 0; col < Math.min(n, m - 1); col++) {
        // Partial pivoting
        let maxRow = col;
        let maxVal = Math.abs(matrix[col][col]);
        
        for (let row = col + 1; row < n; row++) {
            const absVal = Math.abs(matrix[row][col]);
            if (absVal > maxVal) {
                maxVal = absVal;
                maxRow = row;
            }
        }

        // Swap rows if needed
        if (maxRow !== col) {
            [matrix[col], matrix[maxRow]] = [matrix[maxRow], matrix[col]];
            steps.push({
                description: `Swap R${col + 1} ↔ R${maxRow + 1}`,
                matrix: matrix.map(row => [...row]),
                highlightedRows: [col, maxRow]
            });
        }

        // Check for zero pivot
        if (Math.abs(matrix[col][col]) < 1e-10) {
            const isZeroRow = matrix[col].slice(0, m - 1).every(val => Math.abs(val) < 1e-10);
            if (!isZeroRow || Math.abs(matrix[col][m - 1]) > 1e-10) {
                steps.push({
                    description: `Row ${col + 1} has zero pivot`,
                    matrix: matrix.map(row => [...row]),
                    highlightedRows: [col]
                });
            }
            continue;
        }

        // Eliminate below current pivot
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(matrix[row][col]) < 1e-10) continue;
            
            const factor = matrix[row][col] / matrix[col][col];
            
            for (let k = col; k < m; k++) {
                matrix[row][k] -= factor * matrix[col][k];
                if (Math.abs(matrix[row][k]) < 1e-10) {
                    matrix[row][k] = 0;
                }
            }

            steps.push({
                description: `R${row + 1} = R${row + 1} - (${factor.toFixed(2)}) × R${col + 1}`,
                matrix: matrix.map(row => [...row]),
                highlightedRows: [row]
            });
        }
    }

    // Analyze the system
    let hasSolution = true;
    let hasUniqueSolution = false;
    let hasInfiniteSolutions = false;
    const numVariables = m - 1;
    
    const pivotCols = new Set<number>();
    let rank = 0;
    
    for (let i = 0; i < n; i++) {
        let leadingCol = -1;
        
        for (let j = 0; j < numVariables; j++) {
            if (Math.abs(matrix[i][j]) > 1e-10) {
                leadingCol = j;
                pivotCols.add(j);
                rank++;
                break;
            }
        }
        
        if (leadingCol === -1) {
            if (Math.abs(matrix[i][m - 1]) > 1e-10) {
                hasSolution = false;
                steps.push({
                    description: `Row ${i + 1}: 0 = ${matrix[i][m - 1].toFixed(2)} → No solution`,
                    matrix: matrix.map(row => [...row]),
                    highlightedRows: [i]
                });
                break;
            }
        }
    }
    
    if (hasSolution) {
        if (rank === numVariables) {
            hasUniqueSolution = true;
        } else {
            hasInfiniteSolutions = true;
            const numFreeVariables = numVariables - rank;
            steps.push({
                description: `System has ${numFreeVariables} free variable${numFreeVariables > 1 ? 's' : ''} → Infinite solutions`,
                matrix: matrix.map(row => [...row])
            });
        }
    }

    // Back substitution
    const solutions: number[] = new Array(numVariables).fill(0);
    
    if (hasUniqueSolution) {
        for (let i = n - 1; i >= 0; i--) {
            let leadingCol = -1;
            for (let j = 0; j < numVariables; j++) {
                if (Math.abs(matrix[i][j]) > 1e-10) {
                    leadingCol = j;
                    break;
                }
            }
            
            if (leadingCol === -1) continue;
            
            let sum = matrix[i][m - 1];
            for (let j = leadingCol + 1; j < numVariables; j++) {
                sum -= matrix[i][j] * solutions[j];
            }
            
            solutions[leadingCol] = sum / matrix[i][leadingCol];
            
            steps.push({
                description: `x${leadingCol + 1} = ${solutions[leadingCol].toFixed(2)}`,
                matrix: matrix.map(row => [...row]),
                highlightedRows: [i]
            });
        }
    }

    return {
        steps,
        result: {
            finalMatrix: matrix,
            solution: hasUniqueSolution ? solutions : undefined,
            determinant: undefined,
            hasUniqueSolution,
            hasInfiniteSolutions,
            hasNoSolution: !hasSolution
        }
    };
}

/**
 * Gauss-Jordan Elimination - To RREF
 */
export const gaussJordan = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    const m = matrix[0].length;
    
    steps.push({
        description: 'Initial Matrix',
        matrix: copyMatrix(matrix),
    });

    let lead = 0;

    for (let row = 0; row < n; row++) {
        if (lead >= m) break;

        // Find pivot
        let pivotRow = row;
        while (Math.abs(matrix[pivotRow][lead]) < 1e-10) {
            pivotRow++;
            if (pivotRow === n) {
                pivotRow = row;
                lead++;
                if (lead === m) break;
            }
        }

        if (lead === m) break;

        // Swap rows
        if (pivotRow !== row) {
            matrix = swapRows(matrix, row, pivotRow);
            steps.push({
                description: `Swap R${row + 1} ↔ R${pivotRow + 1}`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row, pivotRow]
            });
        }

        // Scale pivot to 1
        const pivot = matrix[row][lead];
        if (Math.abs(pivot) > 1e-10 && Math.abs(pivot - 1) > 1e-10) {
            const factor = 1 / pivot;
            matrix = multiplyRow(matrix, row, factor);
            matrix = cleanMatrix(matrix);
            steps.push({
                description: `R${row + 1} = R${row + 1} × ${factor.toFixed(2)}`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row]
            });
        }

        // Eliminate other rows
        for (let i = 0; i < n; i++) {
            if (i !== row) {
                const factor = matrix[i][lead];
                if (Math.abs(factor) > 1e-10) {
                    matrix = addRows(matrix, i, row, -factor);
                    matrix = cleanMatrix(matrix);
                    
                    steps.push({
                        description: `R${i + 1} = R${i + 1} - (${factor.toFixed(2)}) × R${row + 1}`,
                        matrix: copyMatrix(matrix),
                        highlightedRows: [row, i]
                    });
                }
            }
        }

        lead++;
    }

    steps.push({
        description: 'RREF achieved',
        matrix: copyMatrix(matrix),
    });

    // Extract solution
    const solution: number[] = [];
    if (m === n + 1) {
        for (let i = 0; i < n; i++) {
            solution.push(cleanNumber(matrix[i][m - 1]));
        }
    }

    return {
        steps,
        result: {
            finalMatrix: matrix,
            solution: solution.length > 0 ? solution : undefined
        }
    };
};


/**
 * Calculate Determinant using Row reduction
 */
export const calculateDeterminant = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    
    // Validation
    if (n !== matrix[0].length) {
        steps.push({
            description: 'Error: Determinant only exists for square matrices',
            matrix: copyMatrix(matrix),
        });
        return {
            steps,
            result: {
                finalMatrix: matrix,
                determinant: NaN
            }
        };
    }

    steps.push({
        description: 'Initial Matrix',
        matrix: copyMatrix(matrix),
    });

    let determinant = 1;
    let swapCount = 0;

    // Forward elimination
    for (let col = 0; col < n; col++) {
        // Find pivot
        let pivotRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivotRow][col])) {
                pivotRow = row;
            }
        }

        // Check for zero pivot
        if (Math.abs(matrix[pivotRow][col]) < 1e-10) {
            steps.push({
                description: 'Determinant = 0 (zero column detected)',
                matrix: copyMatrix(matrix),
                highlightedRows: [col]
            });
            return {
                steps,
                result: {
                    finalMatrix: matrix,
                    determinant: 0
                }
            };
        }

        // Swap rows
        if (pivotRow !== col) {
            matrix = swapRows(matrix, col, pivotRow);
            swapCount++;
            determinant *= -1;
            steps.push({
                description: `Swap R${col + 1} ↔ R${pivotRow + 1} (det sign changes)`,
                matrix: copyMatrix(matrix),
                highlightedRows: [col, pivotRow]
            });
        }

        // Multiply determinant by pivot
        const pivot = matrix[col][col];
        determinant *= pivot;

        steps.push({
            description: `Pivot = ${pivot.toFixed(2)}, running det = ${determinant.toFixed(2)}`,
            matrix: copyMatrix(matrix),
            highlightedRows: [col]
        });

        // Eliminate below pivot
        for (let row = col + 1; row < n; row++) {
            const factor = matrix[row][col] / pivot;
            if (Math.abs(factor) > 1e-10) {
                matrix = addRows(matrix, row, col, -factor);
                matrix = cleanMatrix(matrix);
                steps.push({
                    description: `R${row + 1} = R${row + 1} - (${factor.toFixed(2)}) × R${col + 1}`,
                    matrix: copyMatrix(matrix),
                    highlightedRows: [col, row]
                });
            }
        }
    }

    determinant = cleanNumber(determinant);

    steps.push({
        description: `Final determinant = ${determinant.toFixed(2)}`,
        matrix: copyMatrix(matrix),
    });

    return {
        steps,
        result: {
            finalMatrix: matrix,
            determinant
        }
    };
};

/**
 * Matrix Inverse using Gauss-Jordan
 */
export const calculateInverse = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    const n = inputMatrix.length;
    
    // Validation
    if (n !== inputMatrix[0].length) {
        steps.push({
            description: 'Error: Only square matrices have inverses',
            matrix: copyMatrix(inputMatrix),
        });
        return {
            steps,
            result: { 
                finalMatrix: inputMatrix,
                error: 'Matrix must be square to have an inverse'
            }
        };
    }

    // Create augmented matrix [A | I]
    const augmented: number[][] = inputMatrix.map((row, i) => [
        ...row,
        ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
    ]);

    steps.push({
        description: 'Augmented matrix [A | I]',
        matrix: copyMatrix(augmented),
    });

    // Apply Gauss-Jordan
    const result = gaussJordan(augmented);
    
    // Check if left side became identity
    const isIdentity = result.result.finalMatrix.every((row, i) => 
        row.slice(0, n).every((val, j) => 
            Math.abs(val - (i === j ? 1 : 0)) < 1e-10)
    );

    steps.push(...result.steps);

    if (!isIdentity) {
        steps.push({
            description: 'Matrix is singular (not invertible)',
            matrix: result.result.finalMatrix
        });
        return {
            steps,
            result: { 
                finalMatrix: result.result.finalMatrix,
                inverse: undefined,
                error: 'Matrix is singular (determinant = 0). No inverse exists.'
            }
        };
    }

    // Extract inverse from right side
    const inverse = result.result.finalMatrix.map(row => row.slice(n));
    
    steps.push({
        description: 'Inverse matrix found',
        matrix: inverse
    });

    return {
        steps,
        result: {
            finalMatrix: inverse,
            inverse: inverse
        }
    };
};