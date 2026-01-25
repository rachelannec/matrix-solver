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
        description: 'Starting Point: This is your original augmented matrix.\n\nOur goal: Transform it step-by-step into Row Echelon Form (REF) to solve the system of equations.',
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
                description: `Row Swap: Moving R${maxRow + 1} to position ${col + 1}\n\nWhy? We want the largest absolute value in column ${col + 1} as the pivot. This improves numerical stability and reduces rounding errors in calculations.`,
                matrix: matrix.map(row => [...row]),
                highlightedRows: [col, maxRow]
            });
        }

        // Check for zero pivot
        if (Math.abs(matrix[col][col]) < 1e-10) {
            const isZeroRow = matrix[col].slice(0, m - 1).every(val => Math.abs(val) < 1e-10);
            if (!isZeroRow || Math.abs(matrix[col][m - 1]) > 1e-10) {
                steps.push({
                    description: `Problem Detected: Row ${col + 1} has a zero in the pivot position.\n\nThis indicates the system might have no solution or infinitely many solutions. We'll continue the process to determine which case applies.`,
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
                description: `Elimination Step: Creating a zero in position (${row + 1}, ${col + 1})\n\nOperation: R${row + 1} = R${row + 1} - (${factor.toFixed(2)}) × R${col + 1}\n\nWhy? We're systematically creating zeros below each pivot element. This forms a "staircase" pattern that makes the system easier to solve.`,
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
                    description: `Contradiction Found in Row ${i + 1}\n\nThis row says: 0 = ${matrix[i][m - 1].toFixed(2)}\n\nMeaning: The system has NO SOLUTION. The equations contradict each other and cannot all be satisfied simultaneously. This is called an "inconsistent system."`,
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
            steps.push({
                description: `Analysis Complete: The system has exactly ONE UNIQUE SOLUTION.\n\nWe have ${rank} pivot positions for ${numVariables} variables, which means every variable can be uniquely determined.\n\nNext: We'll use back-substitution to find the actual values of each variable.`,
                matrix: matrix.map(row => [...row])
            });
        } else {
            hasInfiniteSolutions = true;
            const numFreeVariables = numVariables - rank;
            steps.push({
                description: `Analysis Complete: The system has INFINITELY MANY SOLUTIONS.\n\nWe have ${rank} pivot positions but ${numVariables} variables. This creates ${numFreeVariables} free variable${numFreeVariables > 1 ? 's' : ''}.\n\nFree variables can take any value, and the other variables are expressed in terms of them. This represents a line or plane of solutions.`,
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
                description: `Back-Substitution: Solving for x${leadingCol + 1}\n\nFrom row ${i + 1}: x${leadingCol + 1} = ${solutions[leadingCol].toFixed(2)}\n\nWe start from the bottom row and work upward, substituting known values to find each unknown variable.`,
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
        description: 'Starting Point: Your original matrix.\n\nGoal: Transform this into Reduced Row Echelon Form (RREF), where each leading 1 is the only non-zero entry in its column. This makes the solution immediately readable.',
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
                description: `Row Swap: Moving R${pivotRow + 1} to position ${row + 1}\n\nWhy? We need a non-zero element in the current pivot position to proceed with the elimination process.`,
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
                description: `Scaling Row ${row + 1}: Making the pivot equal to 1\n\nOperation: R${row + 1} = R${row + 1} × ${factor.toFixed(2)}\n\nWhy? In RREF, every pivot position must contain the value 1. This is achieved by dividing the entire row by the pivot value.`,
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
                        description: `Clearing Column ${lead + 1}: Making entry (${i + 1}, ${lead + 1}) equal to zero\n\nOperation: R${i + 1} = R${i + 1} - (${factor.toFixed(2)}) × R${row + 1}\n\nWhy? In RREF, each leading 1 must be the ONLY non-zero entry in its entire column (not just below, but above too). This makes solutions directly readable.`,
                        matrix: copyMatrix(matrix),
                        highlightedRows: [row, i]
                    });
                }
            }
        }

        lead++;
    }

    steps.push({
        description: 'RREF Achieved: The matrix is now in its simplest form.\n\nEach non-zero row starts with a leading 1, and each leading 1 is the only non-zero entry in its column. Variables can now be read directly from the rightmost column.',
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
            description: 'Error: Determinants only exist for square matrices.\n\nYour matrix must have the same number of rows and columns to calculate a determinant.',
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
        description: 'Starting Determinant Calculation\n\nStrategy: We\'ll transform the matrix to upper triangular form using row operations. The determinant equals the product of the diagonal entries, adjusted for any row swaps we perform.',
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
                description: 'Zero Column Detected: Determinant = 0\n\nWhen an entire column becomes zero during elimination, the determinant is automatically zero. This means:\n- The matrix is singular (not invertible)\n- The rows/columns are linearly dependent\n- The matrix has no unique inverse',
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
                description: `Row Swap: R${col + 1} ↔ R${pivotRow + 1}\n\nImportant: Each row swap multiplies the determinant by -1.\nCurrent determinant sign: ${determinant > 0 ? 'positive' : 'negative'}\n\nThis is a fundamental property: swapping two rows changes the sign of the determinant.`,
                matrix: copyMatrix(matrix),
                highlightedRows: [col, pivotRow]
            });
        }

        // Multiply determinant by pivot
        const pivot = matrix[col][col];
        determinant *= pivot;

        steps.push({
            description: `Tracking the Determinant:\n\nCurrent pivot value: ${pivot.toFixed(2)}\nRunning product: ${determinant.toFixed(2)}\n\nThe determinant is the product of all diagonal entries in the triangular form. We multiply as we go to keep track of the final value.`,
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
                    description: `Elimination: Creating zero at position (${row + 1}, ${col + 1})\n\nOperation: R${row + 1} = R${row + 1} - (${factor.toFixed(2)}) × R${col + 1}\n\nNote: This type of row operation (adding a multiple of one row to another) does NOT change the determinant value. Only the row swaps affect the sign.`,
                    matrix: copyMatrix(matrix),
                    highlightedRows: [col, row]
                });
            }
        }
    }

    determinant = cleanNumber(determinant);

    steps.push({
        description: `Final Result: Determinant = ${determinant.toFixed(2)}\n\nInterpretation:\n${determinant === 0 ? '- The matrix is SINGULAR (not invertible)\n- The columns are linearly dependent\n- The transformation collapses space to a lower dimension' : '- The matrix is INVERTIBLE\n- The columns are linearly independent\n- The transformation preserves dimensionality'}\n\n${swapCount > 0 ? `We performed ${swapCount} row swap${swapCount > 1 ? 's' : ''}, which affected the final sign.` : 'No row swaps were needed.'}`,
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
            description: 'Error: Only square matrices can have inverses.\n\nYour matrix must have the same number of rows and columns. Non-square matrices don\'t have multiplicative inverses in the traditional sense.',
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
        description: 'Setting Up: Creating Augmented Matrix [A | I]\n\nLeft side: Your original matrix (A)\nRight side: Identity matrix (I)\n\nStrategy: If we can transform the left side into the identity matrix using row operations, the right side will become A⁻¹. This works because the same operations that transform A into I will transform I into A⁻¹.',
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
            description: 'Matrix is Singular: No Inverse Exists\n\nThe left side could not be transformed into the identity matrix. This means:\n- The determinant is zero\n- The matrix is not invertible\n- The rows are linearly dependent\n- The transformation is not reversible\n\nOnly matrices with non-zero determinants have inverses.',
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
        description: 'Success: Inverse Matrix Found\n\nThe right side of our augmented matrix is now A⁻¹ (the inverse of A).\n\nVerification: If you multiply A × A⁻¹, you will get the identity matrix I. This confirms that A⁻¹ is indeed the inverse.\n\nUse: The inverse is useful for solving matrix equations of the form AX = B, where X = A⁻¹B.',
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