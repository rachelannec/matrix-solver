import { useState } from 'react';
import MatrixInput from './components/MatrixInput';
import StepVisualization from './components/StepVisualization';
import SolutionDisplay from './components/SolutionDisplay';
import OperationSelector from './components/OperationSelector';
import { validateMatrix } from './utils/matrixValidator';
import { gaussianElimination, calculateDeterminant } from './utils/matrixOperations';
import type { Step, SolutionResult } from './types/matrix';
import './App.css';

const App = () => {
    const [steps, setSteps] = useState<Step[]>([]);
    const [solution, setSolution] = useState<SolutionResult | null>(null);
    const [operation, setOperation] = useState<string>('gaussian-elimination');

    const handleMatrixInput = (inputMatrix: number[][]) => {
        if (validateMatrix(inputMatrix)) {
            // Generate steps based on operation
            let result;
            switch (operation.toLowerCase()) {
                case 'gaussian elimination':
                case 'gaussian-elimination':
                    result = gaussianElimination(inputMatrix);
                    break;
                case 'determinant':
                    result = calculateDeterminant(inputMatrix);
                    break;
                default:
                    result = { 
                        steps: [{ description: 'Operation not implemented', matrix: inputMatrix }], 
                        result: { finalMatrix: inputMatrix } 
                    };
            }
            
            setSteps(result.steps);
            setSolution(result.result);
        } else {
            alert('Invalid matrix input. Please check the format.');
        }
    };

    return (
        <div className="App">
            <div className="container">
                <h1>Linear Algebra Visualization Tool</h1>
                <OperationSelector 
                    selectedOperation={operation} 
                    onOperationChange={setOperation} 
                />
                <MatrixInput onMatrixInput={handleMatrixInput} />
                {steps.length > 0 && <StepVisualization steps={steps} />}
                {solution && <SolutionDisplay solution={solution} />}
            </div>
        </div>
    );
};

export default App;

// for number formatting
// npm install mathjax-full
// npm install @types/mathjax-full --save-dev