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

// Helper: Format number for display in steps
// tries to express as integer, fraction, or minimal decimals
const formatStepNumber = (num: number): string => {
    // If it's essentially an integer, show it as such
    if (Math.abs(num - Math.round(num)) < 1e-10) {
        return Math.round(num).toString();
    }
    
    // Try to express as a simple fraction
    const fraction = toFraction(num);
    if (fraction) {
        return fraction;
    }
    
    // Otherwise show with minimal decimals
    return num.toFixed(2).replace(/\.?0+$/, '');
};

// Helper: Convert decimal to fraction (for simple fractions)
// Algorthm:
// - Try denominators from 2 to 20
// - for each denominator d, calculate numerator n = round(decimal * d)
// - check if n/d is close enough to decimal (within tolerance)
// - if found, simplify fraction using GCD
// Return LATex fraction
const toFraction = (decimal: number): string | null => {
    const tolerance = 1e-6;
    let numerator = 1;
    let denominator = 1;
    
    // Try denominators up to 20
    for (let d = 2; d <= 20; d++) {
        const n = Math.round(decimal * d);
        if (Math.abs(n / d - decimal) < tolerance) {
            numerator = n;
            denominator = d;
            break;
        }
    }
    
    if (denominator === 1) return null;
    
    // Simplify fraction
    const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b);
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    
    if (denominator === 1) return null;
    
    return `\\frac{${numerator}}{${denominator}}`;
};

// -----
// MAIN OPERATIONS
// -----

/**
 * Gaussian Elimination (Row Echelon Form) - OPT to CHANGE (not same result to other calculators exist)
 * 
 * Goal: Create uppper triangular matrix with zeros below diagonal (row echelon form)
 * 
 * Process:
 * 1. For each column (left to right):
 *      a. find best pivot (largest valye for stability)
 *      b. swap rows if needed to get pivot to top
 *      c. scale pivot row to make pivot =1
 *      d. eliminatr all entries below pivot
 * 2. Result: "Staircase" pattern
 * 3. If augmented matrix, perform back-substition for solution
 * 
 * @param inputMatrix 
 * @returns Objects with steps array and solution result (as to why objects, bcs we'll use it to display solution and steps, hurraah)
 */
export function gaussianElimination(inputMatrix: number[][]): { steps: Step[], result: SolutionResult } {
    const steps: Step[] = [];
    const matrix = inputMatrix.map(row => [...row]); // Deep copy
    const n = matrix.length;
    const m = matrix[0].length;
    
    steps.push({
        description: 'Initial augmented matrix',
        matrix: matrix.map(row => [...row]),
    });

    // Forward elimination with partial pivoting
    for (let col = 0; col < Math.min(n, m - 1); col++) {
        // Partial pivoting: find row with largest absolute value in current column
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
                description: `Swap R${col + 1} ↔ R${maxRow + 1} (partial pivoting for numerical stability)`,
                matrix: matrix.map(row => [...row]),
                highlightedRows: [col, maxRow]
            });
        }

        // Check for zero pivot (singular or inconsistent system)
        if (Math.abs(matrix[col][col]) < 1e-10) {
            const isZeroRow = matrix[col].slice(0, m - 1).every(val => Math.abs(val) < 1e-10);
            if (!isZeroRow || Math.abs(matrix[col][m - 1]) > 1e-10) {
                steps.push({
                    description: `Row ${col + 1} has zero pivot - system may be singular or inconsistent`,
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
                description: `R${row + 1} = R${row + 1} - (${factor.toFixed(4)}) × R${col + 1}`,
                matrix: matrix.map(row => [...row]),
                highlightedRows: [row]
            });
        }
    }

    // Analyze the system
    let hasSolution = true;
    let hasUniqueSolution = false;
    let hasInfiniteSolutions = false;
    const numVariables = m - 1; // Last column is augmented part
    
    // Find pivot positions (leading entries in each row)
    const pivotCols = new Set<number>();
    let rank = 0;
    
    for (let i = 0; i < n; i++) {
        let leadingCol = -1;
        
        // Find first non-zero entry in row
        for (let j = 0; j < numVariables; j++) {
            if (Math.abs(matrix[i][j]) > 1e-10) {
                leadingCol = j;
                pivotCols.add(j);
                rank++;
                break;
            }
        }
        
        // Check for inconsistency: 0 = non-zero
        if (leadingCol === -1) {
            // Zero row in coefficient part
            if (Math.abs(matrix[i][m - 1]) > 1e-10) {
                // But non-zero in augmented part: 0 = b (inconsistent)
                hasSolution = false;
                steps.push({
                    description: `Row ${i + 1}: 0 = ${matrix[i][m - 1].toFixed(4)} → No solution (inconsistent system)`,
                    matrix: matrix.map(row => [...row]),
                    highlightedRows: [i]
                });
                break;
            }
        }
    }
    
    if (hasSolution) {
        // System is consistent
        if (rank === numVariables) {
            // Full rank: unique solution
            hasUniqueSolution = true;
        } else {
            // Rank deficient: infinite solutions (free variables exist)
            hasInfiniteSolutions = true;
            const numFreeVariables = numVariables - rank;
            steps.push({
                description: `System has ${numFreeVariables} free variable${numFreeVariables > 1 ? 's' : ''} → Infinite solutions`,
                matrix: matrix.map(row => [...row])
            });
        }
    }

    // Back substitution (only if unique solution exists)
    const solutions: number[] = new Array(numVariables).fill(0);
    
    if (hasUniqueSolution) {
        for (let i = n - 1; i >= 0; i--) {
            // Find leading coefficient
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
                description: `x${leadingCol + 1} = ${solutions[leadingCol].toFixed(4)}`,
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
 * 
 * Goal: Create identity matrix with zeroes everywhere except diagonal
 * 
 * Diff from Gaussian Elimination:
 * - REF: Only eliminates below pivot (creates upper triangular)
 * - RREF: Eliminates both above and below pivots(create diagonal)
 * 
 * Process:
 * 1. For each row (top to bottom):
 *      a. find non-zero pivot (move to nexxt column if needed)
 *      b. swap rows to get pivot in position
 *      c. scale row to make pivot =1
 *      d. eliminate all other rows (both above and below ) <- KEY DIFF from REF
 * 2. Result: each leading 1 is the only non zero in  its column
 * 3. Solutions can be read directly: last column = variable values
 * 
 * Use cased:
 * - solving systems where you want direct answer (no back substitution)
 * - finding matrix inverse (augment with identity)
 * - determining linear independence
 * - findng basis for col/row space 
 * 
 * @param inputMatrix - originsl matrix
 * @returns object wth steps and solution result
 */
export const gaussJordan = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length; // # of rows
    const m = matrix[0].length; // # of columns
    
    // step 0: record initial state
    steps.push({
        description: '📋 Initial Matrix - We will transform this into Reduced Row Echelon Form (RREF)',
        matrix: copyMatrix(matrix),
    });

    let lead = 0; // track leading column (where we loop for pivots)
    let stepCount = 1;

    // main loop: process each loop
    for (let row = 0; row < n; row++) {
        if (lead >= m) break; // no more columns to process

        steps.push({
            description: `\n🎯 Working on Row ${row + 1}, Column ${lead + 1}`,
            matrix: copyMatrix(matrix),
            highlightedRows: [row]
        });

        // ----- Find pivots: search down from current position 
        // if current position is 0, check rows below
        // if all are zero, move to next column
        let pivotRow = row;
        while (Math.abs(matrix[pivotRow][lead]) < 1e-10) {
            pivotRow++; // try next row
            if (pivotRow === n) {
                // all rows below are zero inthis column
                pivotRow = row; // reset
                lead++; // move to next column
                if (lead === m) break; // no more column
            }
        }

        if (lead === m) break; // ran out of column

        // ----- Swap: move pivot row to current position
        if (pivotRow !== row) {
            matrix = swapRows(matrix, row, pivotRow);
            steps.push({
                description: `Step ${stepCount++}: 🔄 Swap Row ${row + 1} with Row ${pivotRow + 1}\n` +
                            `Operation: $R_{${row + 1}} \\leftrightarrow R_{${pivotRow + 1}}$\n` +
                            `Why? We need a non-zero pivot in this position.`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row, pivotRow],
                operation: 'swap'
            });
        }

        // ----- Scale: make pivot equal to 1
        const pivot = matrix[row][lead];
        // only scale if pivot is non zero and not already 1
        if (Math.abs(pivot) > 1e-10 && Math.abs(pivot - 1) > 1e-10) {
            const factor = 1 / pivot;
            const factorStr = formatStepNumber(factor);
            matrix = multiplyRow(matrix, row, factor);
            matrix = cleanMatrix(matrix);
            steps.push({
                description: `Step ${stepCount++}: ✖️ Scale Row ${row + 1} to make pivot = 1\n` +
                            `Operation: $R_{${row + 1}} \\rightarrow ${factorStr}R_{${row + 1}}$`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row],
                operation: 'multiply'
            });
        }

        // ----- Eliminate: create zerows in all other rows
        // eliminator both above and below the pivot
        for (let i = 0; i < n; i++) {
            if (i !== row) { // to not eliminate the pivot row itself
                const factor = matrix[i][lead];
                if (Math.abs(factor) > 1e-10) {
                    const factorStr = formatStepNumber(factor);

                    // subtract (factor * pivot row) from this row
                    matrix = addRows(matrix, i, row, -factor);
                    matrix = cleanMatrix(matrix);
                    
                    // indicate whether we're eliminating above or below
                    const direction = i < row ? '⬆️ above' : '⬇️ below';
                    steps.push({
                        description: `Step ${stepCount++}: ➖ Eliminate ${direction} the pivot\n` +
                                    `Operation: $R_{${i + 1}} \\rightarrow R_{${i + 1}} - ${factorStr}R_{${row + 1}}$\n` +
                                    `Goal: Create zeros in Column ${lead + 1} for all rows except Row ${row + 1}`,
                        matrix: copyMatrix(matrix),
                        highlightedRows: [row, i],
                        operation: 'add'
                    });
                }
            }
        }

        lead++; // move to next column for next row
    }

    steps.push({
        description: '🎉 Reduced Row Echelon Form (RREF) Achieved!\n' +
                    'Each leading 1 is the ONLY non-zero entry in its column.\n' +
                    'Solutions can be read directly from the matrix!',
        matrix: copyMatrix(matrix),
    });

    // ----- Extract solution: for augmented matrices, last column = answers
    const solution: number[] = [];
    if (m === n + 1) { // augmented matrix check
        for (let i = 0; i < n; i++) {
            // last column value in each row is the solution for that variable
            solution.push(cleanNumber(matrix[i][m - 1]));
        }
        
        steps.push({
            description: '📊 Solution Summary:\n' + 
                        solution.map((val, idx) => `$x_{${idx + 1}} = ${formatStepNumber(val)}$`).join('\n'),
            matrix: copyMatrix(matrix),
        });
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
 * 
 * About Determinant:
 * It is a number that tells us important properties of square matrix
 * - if det != 0: matric is inverible (has unique solution)
 * - if det =0: matrix is singular (infinite or no solution)
 * - scaling factor for volume in transformation
 * 
 * Method: Row reduction with determinant tracking
 * Instead of cofactor expansion (slow for large matrices), we:
 * 1. transfor, to upper triangular form
 * 2. track how operations affect the determinant:
 *      - row swap: multiply by -1
 *      - row scaling by k: multiply det by k
 *      - row addition: no change to det
 * 3. final det = product of diagonal entries (with sign adjustments)
 * 
 * Efficiency:
 * - cofactor expansion - O(n!)
 * - row reduction - O(n^3)
 * 
 * @param inputMatrix - sqaure matrix
 * @returns object with steps and determinant result
 */
export const calculateDeterminant = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    
    // ----- Validation: must be square matrix
    if (n !== matrix[0].length) {
        steps.push({
            description: '❌ Error: Determinant only exists for square matrices',
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
        description: '📋 Initial Matrix - Calculating $\\det(A)$ using row reduction\n' +
                    '💡 The determinant equals the product of diagonal entries (with sign adjustments)',
        matrix: copyMatrix(matrix),
    });

    let determinant = 1; // start with 1, to be multiply by pivots
    let swapCount = 0; // track row swaps (each changes sign)
    let stepCount = 1;

    // ----- Forward elimination with determinant tracking
    for (let col = 0; col < n; col++) {
        steps.push({
            description: `\n🎯 Working on Column ${col + 1}`,
            matrix: copyMatrix(matrix),
            highlightedRows: [col]
        });

        // ----- Find pivot (partial pivoting for stability)
        let pivotRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivotRow][col])) {
                pivotRow = row;
            }
        }

        // ----- Check for zero pivot
        // if yes, entire column below is zero -> det is 0
        if (Math.abs(matrix[pivotRow][col]) < 1e-10) {
            steps.push({
                description: '🚫 Determinant is ZERO!\n' +
                            `Reason: Column ${col + 1} has all zeros from row ${col + 1} onwards.\n` +
                            'This means the matrix is singular (not invertible).',
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

        // ----- Swap rows if needed
        // effect on det: each swap multiplies det by -1
        if (pivotRow !== col) {
            matrix = swapRows(matrix, col, pivotRow);
            swapCount++;
            determinant *= -1; // row swap changes sign
            steps.push({
                description: `Step ${stepCount++}: 🔄 Swap Row ${col + 1} ↔ Row ${pivotRow + 1}\n` +
                            `Operation: $R_{${col + 1}} \\leftrightarrow R_{${pivotRow + 1}}$\n` +
                            `Effect: Determinant sign changes\n` +
                            `Running $\\det = ${formatStepNumber(determinant)} \\times$ (diagonal product so far)`,
                matrix: copyMatrix(matrix),
                highlightedRows: [col, pivotRow],
                operation: 'swap'
            });
        }

        // ----- Multiply determinant by pivot value
        // core calc : for upper triangular matrix det = product of diagonal
        const pivot = matrix[col][col];
        determinant *= pivot;

        steps.push({
            description: `📍 Pivot element $a_{${col + 1},${col + 1}} = ${formatStepNumber(pivot)}$\n` +
                        `Multiply into determinant: $\\det = ${formatStepNumber(determinant)}$`,
            matrix: copyMatrix(matrix),
            highlightedRows: [col]
        });

        // ----- Eliminate below pivot
        // important: row addition doesn;t change determinant
        for (let row = col + 1; row < n; row++) {
            const factor = matrix[row][col] / pivot;
            if (Math.abs(factor) > 1e-10) {
                const factorStr = formatStepNumber(factor);
                matrix = addRows(matrix, row, col, -factor);
                matrix = cleanMatrix(matrix);
                steps.push({
                    description: `Step ${stepCount++}: ➖ Eliminate below pivot\n` +
                                `Operation: $R_{${row + 1}} \\rightarrow R_{${row + 1}} - ${factorStr}R_{${col + 1}}$\n` +
                                `Note: Row operations like this don't change the determinant!`,
                    matrix: copyMatrix(matrix),
                    highlightedRows: [col, row]
                });
            }
        }
    }

    // clean up final det value
    determinant = cleanNumber(determinant);

    steps.push({
        description: `\n🎉 Final Result!\n\n` +
                    `$\\det(A) = ${formatStepNumber(determinant)}$\n\n` +
                    `Summary:\n` +
                    `• Number of row swaps: ${swapCount} (sign changed ${swapCount} times)\n` +
                    `• Product of diagonal: ${formatStepNumber(determinant)}\n` +
                    `• Matrix is ${Math.abs(determinant) > 1e-10 ? 'INVERTIBLE ✅' : 'SINGULAR ❌'}`,
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
 * 
 * About Matrix inverse (A^-1):
 * - unique matrix such that: A × A⁻¹ = A⁻¹ × A = I (identity matrix)
 * 
 * Intuition:
 * - regular number: 5 * (1/5) = 1
 * - matrices: A * A^-1 = I
 * - "undoing" the transformation A
 * 
 * Requirements: 
 * - must be square
 * - must be invertible (det != 0)
 * 
 * Method: Augment matrix with gauss jordan
 * 1. Create [A | I] - augment original with identity matrix
 * 2. Apply gauss-jordan to transform left side to identity
 * 3. When left becomes I, right becomes A^-1
 * 
 * WHY IT WORKS:
 * Row operations on [A | I] are like multiplying both sides by a matrix:
 *   E₃E₂E₁A = I    (left side becomes identity)
 *   E₃E₂E₁I = A⁻¹  (right side becomes inverse)
 * 
 * @param inputMatrix - square matrix to invert
 * @returns 
 */

export const calculateInverse = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    const n = inputMatrix.length;
    
    // ----- Validation: must be sqare matrix
    if (n !== inputMatrix[0].length) {
        steps.push({
            description: '❌ Error: Only square matrices have inverses',
            matrix: copyMatrix(inputMatrix),
        });
        return {
            steps,
            result: { finalMatrix: inputMatrix }
        };
    }

    // ----- Step 1: Create augmented matrix [A | I]
    // left side: original matrix A
    // right side: identity matrix I (1s on diagonal)
    const augmented: number[][] = inputMatrix.map((row, i) => [
        ...row, // copy of original row
        ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0)) // addthe identity row
    ]);
    // result: 2n columns (from A and I)

    steps.push({
        description: '📋 Step 1: Create Augmented Matrix $[A | I]$\n' +
                    'Left side: Original matrix $A$\n' +
                    'Right side: Identity matrix $I$\n\n' +
                    'Goal: Transform left side to $I$, then right side becomes $A^{-1}$',
        matrix: copyMatrix(augmented),
    });

    // ----- Step 2: Apply Gauss-Jordan to get [I | A^(-1)]
    // use the existing gauss-jordan function!
    // it will reduce the left side (A) to identity form
    // also, the right side (I) becomes the inverse
    const result = gaussJordan(augmented);
    
    // ----- Step 3: Extract inverse from right sid
    // after gauss-jordan, columns n to 2n-1 contain A^-1
    const inverse = result.result.finalMatrix.map(row => row.slice(n));
    
    // ----- Verification: Check if we got identity on left side
    // id not, matrix is singular (non-invertible)
    const isIdentity = result.result.finalMatrix.every((row, i) => 
        row.slice(0, n).every((val, j) => 
            // check: diagonla should be 1, off-diagonal should be 0
            Math.abs(val - (i === j ? 1 : 0)) < 1e-10)
    );

    if (!isIdentity) {
        // matrix reduction failed? -> matrix is singular
        steps.push(...result.steps);
        steps.push({
            description: '❌ Matrix is NOT INVERTIBLE (Singular Matrix)\n' +
                        'The left side could not be reduced to the identity matrix.\n' +
                        'This means $\\det(A) = 0$ and no inverse exists.',
            matrix: result.result.finalMatrix
        });
        return {
            steps,
            result: { finalMatrix: result.result.finalMatrix }
        };
    }

    steps.push(...result.steps);
    steps.push({
        description: '🎉 Inverse Matrix Found!\n' +
                    'The right side of our augmented matrix is now $A^{-1}$\n\n' +
                    'Verification: $A \\times A^{-1} = I$ (Identity Matrix)',
        matrix: inverse
    });

    return {
        steps,
        result: {
            finalMatrix: inverse
        }
    };
};