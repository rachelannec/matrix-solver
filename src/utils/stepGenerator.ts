import type { Step } from '../types/matrix';
import { gaussianElimination, gaussJordan, calculateDeterminant, calculateInverse } from './matrixOperations';

export const generateSteps = (matrix: number[][], operation: string): Step[] => {
    switch (operation.toLowerCase()) {
        case 'gaussian elimination':
        case 'gaussian-elimination':
            return gaussianElimination(matrix).steps;
        
        case 'gauss-jordan':
        case 'rref':
            return gaussJordan(matrix).steps;
        
        case 'determinant':
            return calculateDeterminant(matrix).steps;
        
        case 'inverse':
            return calculateInverse(matrix).steps;
        
        default:
            return [{
                description: 'Operation not yet implemented',
                matrix: matrix
            }];
    }
};