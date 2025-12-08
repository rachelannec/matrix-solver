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

// Helper: Round small numbers to zero
const cleanNumber = (num: number, tolerance: number = 1e-10): number => {
    return Math.abs(num) < tolerance ? 0 : num;
};

const cleanMatrix = (matrix: number[][]): number[][] => {
    return matrix.map(row => row.map(val => cleanNumber(val)));
};

// Gaussian Elimination (Row Echelon Form)
export const gaussianElimination = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    const m = matrix[0].length;
    
    steps.push({
        description: 'Starting matrix (Gaussian Elimination)',
        matrix: copyMatrix(matrix),
    });

    let currentRow = 0;

    // Forward elimination - create row echelon form
    for (let col = 0; col < Math.min(n, m - 1); col++) {
        if (currentRow >= n) break;

        // Find pivot (largest absolute value in column)
        let pivotRow = currentRow;
        let maxVal = Math.abs(matrix[currentRow][col]);
        
        for (let row = currentRow + 1; row < n; row++) {
            if (Math.abs(matrix[row][col]) > maxVal) {
                maxVal = Math.abs(matrix[row][col]);
                pivotRow = row;
            }
        }

        // Skip column if all zeros
        if (Math.abs(matrix[pivotRow][col]) < 1e-10) {
            steps.push({
                description: `Column ${col + 1} has all zeros below row ${currentRow + 1}, skipping`,
                matrix: copyMatrix(matrix),
                highlightedRows: [currentRow]
            });
            continue;
        }

        // Swap rows if needed
        if (pivotRow !== currentRow) {
            matrix = swapRows(matrix, currentRow, pivotRow);
            steps.push({
                description: `Swap Row ${currentRow + 1} ↔ Row ${pivotRow + 1} (pivot selection)`,
                matrix: copyMatrix(matrix),
                highlightedRows: [currentRow, pivotRow],
                operation: 'swap'
            });
        }

        // Scale pivot to 1
        const pivot = matrix[currentRow][col];
        if (Math.abs(pivot - 1) > 1e-10) {
            matrix = multiplyRow(matrix, currentRow, 1 / pivot);
            matrix = cleanMatrix(matrix);
            steps.push({
                description: `R${currentRow + 1} → (1/${pivot.toFixed(3)})R${currentRow + 1}`,
                matrix: copyMatrix(matrix),
                highlightedRows: [currentRow],
                operation: 'multiply'
            });
        }

        // Eliminate below pivot
        for (let row = currentRow + 1; row < n; row++) {
            const factor = matrix[row][col];
            if (Math.abs(factor) > 1e-10) {
                matrix = addRows(matrix, row, currentRow, -factor);
                matrix = cleanMatrix(matrix);
                steps.push({
                    description: `R${row + 1} → R${row + 1} - (${factor.toFixed(3)})R${currentRow + 1}`,
                    matrix: copyMatrix(matrix),
                    highlightedRows: [currentRow, row],
                    operation: 'add'
                });
            }
        }

        currentRow++;
    }

    steps.push({
        description: 'Row Echelon Form achieved',
        matrix: copyMatrix(matrix),
    });

    // Back substitution for augmented matrices
    const solution: number[] = [];
    if (m === n + 1) {
        for (let i = n - 1; i >= 0; i--) {
            let sum = matrix[i][m - 1];
            for (let j = i + 1; j < n; j++) {
                sum -= matrix[i][j] * solution[n - 1 - j];
            }
            solution.unshift(cleanNumber(sum / matrix[i][i]));
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

// Gauss-Jordan Elimination (Reduced Row Echelon Form - RREF)
export const gaussJordan = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    const m = matrix[0].length;
    
    steps.push({
        description: 'Starting matrix (Gauss-Jordan Elimination)',
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

        // Swap rows if needed
        if (pivotRow !== row) {
            matrix = swapRows(matrix, row, pivotRow);
            steps.push({
                description: `Swap Row ${row + 1} ↔ Row ${pivotRow + 1}`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row, pivotRow],
                operation: 'swap'
            });
        }

        // Scale pivot to 1
        const pivot = matrix[row][lead];
        if (Math.abs(pivot) > 1e-10 && Math.abs(pivot - 1) > 1e-10) {
            matrix = multiplyRow(matrix, row, 1 / pivot);
            matrix = cleanMatrix(matrix);
            steps.push({
                description: `R${row + 1} → (1/${pivot.toFixed(3)})R${row + 1}`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row],
                operation: 'multiply'
            });
        }

        // Eliminate ALL other rows (above and below)
        for (let i = 0; i < n; i++) {
            if (i !== row) {
                const factor = matrix[i][lead];
                if (Math.abs(factor) > 1e-10) {
                    matrix = addRows(matrix, i, row, -factor);
                    matrix = cleanMatrix(matrix);
                    steps.push({
                        description: `R${i + 1} → R${i + 1} - (${factor.toFixed(3)})R${row + 1}`,
                        matrix: copyMatrix(matrix),
                        highlightedRows: [row, i],
                        operation: 'add'
                    });
                }
            }
        }

        lead++;
    }

    steps.push({
        description: 'Reduced Row Echelon Form (RREF) achieved',
        matrix: copyMatrix(matrix),
    });

    // Extract solution for augmented matrices
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

// Calculate determinant using row operations (more educational than cofactor)
export const calculateDeterminant = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    
    if (n !== matrix[0].length) {
        steps.push({
            description: 'Error: Matrix must be square to calculate determinant',
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
        description: 'Starting matrix (Determinant calculation using row operations)',
        matrix: copyMatrix(matrix),
    });

    let determinant = 1;
    let swapCount = 0;

    // Forward elimination with determinant tracking
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
                description: 'Determinant is 0 (column of zeros found)',
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

        // Swap if needed
        if (pivotRow !== col) {
            matrix = swapRows(matrix, col, pivotRow);
            swapCount++;
            determinant *= -1;
            steps.push({
                description: `Swap Row ${col + 1} ↔ Row ${pivotRow + 1} (det multiplied by -1)`,
                matrix: copyMatrix(matrix),
                highlightedRows: [col, pivotRow],
                operation: 'swap'
            });
        }

        // Track pivot in determinant
        const pivot = matrix[col][col];
        determinant *= pivot;

        steps.push({
            description: `Pivot at (${col + 1}, ${col + 1}) = ${pivot.toFixed(3)}, det = ${determinant.toFixed(3)}`,
            matrix: copyMatrix(matrix),
            highlightedRows: [col]
        });

        // Eliminate below
        for (let row = col + 1; row < n; row++) {
            const factor = matrix[row][col] / pivot;
            if (Math.abs(factor) > 1e-10) {
                matrix = addRows(matrix, row, col, -factor);
                matrix = cleanMatrix(matrix);
                steps.push({
                    description: `R${row + 1} → R${row + 1} - (${factor.toFixed(3)})R${col + 1}`,
                    matrix: copyMatrix(matrix),
                    highlightedRows: [col, row]
                });
            }
        }
    }

    determinant = cleanNumber(determinant);

    steps.push({
        description: `Final determinant = ${determinant.toFixed(3)}`,
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

// Matrix Inverse using Gauss-Jordan
export const calculateInverse = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    const n = inputMatrix.length;
    
    if (n !== inputMatrix[0].length) {
        steps.push({
            description: 'Error: Matrix must be square to find inverse',
            matrix: copyMatrix(inputMatrix),
        });
        return {
            steps,
            result: { finalMatrix: inputMatrix }
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

    // Apply Gauss-Jordan to get [I | A^(-1)]
    const result = gaussJordan(augmented);
    
    // Extract inverse from right side
    const inverse = result.result.finalMatrix.map(row => row.slice(n));
    
    // Check if we got identity on left side
    const isIdentity = result.result.finalMatrix.every((row, i) => 
        row.slice(0, n).every((val, j) => Math.abs(val - (i === j ? 1 : 0)) < 1e-10)
    );

    if (!isIdentity) {
        steps.push(...result.steps);
        steps.push({
            description: 'Matrix is singular (not invertible)',
            matrix: result.result.finalMatrix
        });
        return {
            steps,
            result: { finalMatrix: result.result.finalMatrix }
        };
    }

    steps.push(...result.steps);
    steps.push({
        description: 'Inverse matrix extracted',
        matrix: inverse
    });

    return {
        steps,
        result: {
            finalMatrix: inverse
        }
    };
};