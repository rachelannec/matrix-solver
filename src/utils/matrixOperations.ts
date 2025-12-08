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

// Helper: Format number for display in steps
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

// Gaussian Elimination (Row Echelon Form)
export const gaussianElimination = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    const m = matrix[0].length;
    
    steps.push({
        description: '📋 Initial Matrix - We will transform this into Row Echelon Form using Gaussian Elimination',
        matrix: copyMatrix(matrix),
    });

    let currentRow = 0;
    let stepCount = 1;

    // Forward elimination - create row echelon form
    for (let col = 0; col < Math.min(n, m - 1); col++) {
        if (currentRow >= n) break;

        steps.push({
            description: `\n🎯 Working on Column ${col + 1}`,
            matrix: copyMatrix(matrix),
            highlightedRows: [currentRow]
        });

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
                description: `⚠️ All entries below Row ${currentRow + 1} in Column ${col + 1} are zero. Moving to next column.`,
                matrix: copyMatrix(matrix),
                highlightedRows: [currentRow]
            });
            continue;
        }

        // Swap rows if needed
        if (pivotRow !== currentRow) {
            matrix = swapRows(matrix, currentRow, pivotRow);
            steps.push({
                description: `Step ${stepCount++}: 🔄 Swap Row ${currentRow + 1} with Row ${pivotRow + 1}\n` +
                            `Operation: $R_{${currentRow + 1}} \\leftrightarrow R_{${pivotRow + 1}}$\n` +
                            `Why? We want the largest value as our pivot for numerical stability.`,
                matrix: copyMatrix(matrix),
                highlightedRows: [currentRow, pivotRow],
                operation: 'swap'
            });
        }

        // Scale pivot to 1
        const pivot = matrix[currentRow][col];
        if (Math.abs(pivot - 1) > 1e-10) {
            const factor = 1 / pivot;
            const factorStr = formatStepNumber(factor);
            matrix = multiplyRow(matrix, currentRow, factor);
            matrix = cleanMatrix(matrix);
            steps.push({
                description: `Step ${stepCount++}: ✖️ Scale Row ${currentRow + 1} to make pivot = 1\n` +
                            `Operation: $R_{${currentRow + 1}} \\rightarrow ${factorStr}R_{${currentRow + 1}}$\n` +
                            `Goal: Make the pivot element equal to 1`,
                matrix: copyMatrix(matrix),
                highlightedRows: [currentRow],
                operation: 'multiply'
            });
        }

        // Eliminate below pivot
        let eliminationHappened = false;
        for (let row = currentRow + 1; row < n; row++) {
            const factor = matrix[row][col];
            if (Math.abs(factor) > 1e-10) {
                eliminationHappened = true;
                const factorStr = formatStepNumber(factor);
                matrix = addRows(matrix, row, currentRow, -factor);
                matrix = cleanMatrix(matrix);
                steps.push({
                    description: `Step ${stepCount++}: ➖ Eliminate entry at Row ${row + 1}, Column ${col + 1}\n` +
                                `Operation: $R_{${row + 1}} \\rightarrow R_{${row + 1}} - ${factorStr}R_{${currentRow + 1}}$\n` +
                                `Goal: Create a zero below the pivot`,
                    matrix: copyMatrix(matrix),
                    highlightedRows: [currentRow, row],
                    operation: 'add'
                });
            }
        }

        if (!eliminationHappened) {
            steps.push({
                description: `✅ Column ${col + 1} already has zeros below the pivot!`,
                matrix: copyMatrix(matrix),
                highlightedRows: [currentRow]
            });
        }

        currentRow++;
    }

    steps.push({
        description: '🎉 Row Echelon Form Achieved!\n' +
                    'The matrix now has a "staircase" pattern with zeros below each leading entry.',
        matrix: copyMatrix(matrix),
    });

    // Back substitution for augmented matrices
    const solution: number[] = [];
    if (m === n + 1) {
        steps.push({
            description: '🔙 Starting Back Substitution\n' +
                        'We\'ll solve for variables starting from the bottom row.',
            matrix: copyMatrix(matrix),
        });

        for (let i = n - 1; i >= 0; i--) {
            let sum = matrix[i][m - 1];
            for (let j = i + 1; j < n; j++) {
                sum -= matrix[i][j] * solution[n - 1 - j];
            }
            const value = cleanNumber(sum / matrix[i][i]);
            solution.unshift(value);
            
            steps.push({
                description: `Solved: $x_{${i + 1}} = ${formatStepNumber(value)}$`,
                matrix: copyMatrix(matrix),
                highlightedRows: [i]
            });
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
        description: '📋 Initial Matrix - We will transform this into Reduced Row Echelon Form (RREF)',
        matrix: copyMatrix(matrix),
    });

    let lead = 0;
    let stepCount = 1;

    for (let row = 0; row < n; row++) {
        if (lead >= m) break;

        steps.push({
            description: `\n🎯 Working on Row ${row + 1}, Column ${lead + 1}`,
            matrix: copyMatrix(matrix),
            highlightedRows: [row]
        });

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
                description: `Step ${stepCount++}: 🔄 Swap Row ${row + 1} with Row ${pivotRow + 1}\n` +
                            `Operation: $R_{${row + 1}} \\leftrightarrow R_{${pivotRow + 1}}$\n` +
                            `Why? We need a non-zero pivot in this position.`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row, pivotRow],
                operation: 'swap'
            });
        }

        // Scale pivot to 1
        const pivot = matrix[row][lead];
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

        // Eliminate ALL other rows (above and below) - This is what makes it RREF!
        for (let i = 0; i < n; i++) {
            if (i !== row) {
                const factor = matrix[i][lead];
                if (Math.abs(factor) > 1e-10) {
                    const factorStr = formatStepNumber(factor);
                    matrix = addRows(matrix, i, row, -factor);
                    matrix = cleanMatrix(matrix);
                    
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

        lead++;
    }

    steps.push({
        description: '🎉 Reduced Row Echelon Form (RREF) Achieved!\n' +
                    'Each leading 1 is the ONLY non-zero entry in its column.\n' +
                    'Solutions can be read directly from the matrix!',
        matrix: copyMatrix(matrix),
    });

    // Extract solution for augmented matrices
    const solution: number[] = [];
    if (m === n + 1) {
        for (let i = 0; i < n; i++) {
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

// Calculate determinant using row operations
export const calculateDeterminant = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    
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

    let determinant = 1;
    let swapCount = 0;
    let stepCount = 1;

    // Forward elimination with determinant tracking
    for (let col = 0; col < n; col++) {
        steps.push({
            description: `\n🎯 Working on Column ${col + 1}`,
            matrix: copyMatrix(matrix),
            highlightedRows: [col]
        });

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

        // Swap if needed
        if (pivotRow !== col) {
            matrix = swapRows(matrix, col, pivotRow);
            swapCount++;
            determinant *= -1;
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

        // Track pivot in determinant
        const pivot = matrix[col][col];
        determinant *= pivot;

        steps.push({
            description: `📍 Pivot element $a_{${col + 1},${col + 1}} = ${formatStepNumber(pivot)}$\n` +
                        `Multiply into determinant: $\\det = ${formatStepNumber(determinant)}$`,
            matrix: copyMatrix(matrix),
            highlightedRows: [col]
        });

        // Eliminate below (doesn't change determinant value)
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

// Matrix Inverse using Gauss-Jordan
export const calculateInverse = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    const n = inputMatrix.length;
    
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

    // Create augmented matrix [A | I]
    const augmented: number[][] = inputMatrix.map((row, i) => [
        ...row,
        ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
    ]);

    steps.push({
        description: '📋 Step 1: Create Augmented Matrix $[A | I]$\n' +
                    'Left side: Original matrix $A$\n' +
                    'Right side: Identity matrix $I$\n\n' +
                    'Goal: Transform left side to $I$, then right side becomes $A^{-1}$',
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