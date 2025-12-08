export const validateMatrix = (matrix: number[][]): boolean => {
    if (!matrix || matrix.length === 0) {
        return false;
    }

    const cols = matrix[0].length;
    
    // Check if all rows have the same number of columns
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i].length !== cols) {
            return false;
        }
        
        // Check if all entries are valid numbers
        for (let j = 0; j < matrix[i].length; j++) {
            if (isNaN(matrix[i][j]) || !isFinite(matrix[i][j])) {
                return false;
            }
        }
    }
    
    return true;
};

export const isSquareMatrix = (matrix: number[][]): boolean => {
    return matrix.length === matrix[0]?.length;
};

export const isAugmentedMatrix = (matrix: number[][]): boolean => {
    // For systems of equations, check if it's n×(n+1)
    return matrix[0].length === matrix.length + 1;
};