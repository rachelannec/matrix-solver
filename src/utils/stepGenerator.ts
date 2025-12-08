import type { Step } from '../types/matrix';
import { gaussianElimination, calculateDeterminant } from './matrixOperations';

export const generateSteps = (matrix: number[][], operation: string): Step[] => {
    switch (operation.toLowerCase()) {
        case 'gaussian elimination':
        case 'gaussian-elimination':
            return gaussianElimination(matrix).steps;
        
        case 'determinant':
            return calculateDeterminant(matrix).steps;
        
        default:
            return [{
                description: 'Operation not yet implemented',
                matrix: matrix
            }];
    }
};