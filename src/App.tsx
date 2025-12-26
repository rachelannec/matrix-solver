import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MatrixInput from './components/MatrixInput';
import StepVisualization from './components/StepVisualization';
import SolutionDisplay from './components/SolutionDisplay';
import OperationSelector from './components/OperationSelector';
import ExplanationTab from './components/ExplanationTab';
import { validateMatrix, isSquareMatrix } from './utils/matrixValidator';
import { gaussianElimination, gaussJordan, calculateDeterminant, calculateInverse } from './utils/matrixOperations';
import type { Step, SolutionResult } from './types/matrix';
import './App.css';

function App() {
    const [steps, setSteps] = useState<Step[]>([]);
    const [solution, setSolution] = useState<SolutionResult | null>(null);
    const [operation, setOperation] = useState<string>('gaussian-elimination');
    const [currentTab, setCurrentTab] = useState<string>('solver');

    const handleMatrixInput = (inputMatrix: number[][]) => {
        if (!validateMatrix(inputMatrix)) {
            alert('Invalid matrix input. Please check the format.');
            return;
        }

        // Validate square matrix for determinant and inverse
        if ((operation === 'determinant' || operation === 'inverse') && !isSquareMatrix(inputMatrix)) {
            alert(`${operation === 'determinant' ? 'Determinant' : 'Inverse'} requires a square matrix.`);
            return;
        }

        // Generate steps based on operation
        let result;
        switch (operation.toLowerCase()) {
            case 'gaussian elimination':
            case 'gaussian-elimination':
                result = gaussianElimination(inputMatrix);
                break;
            case 'gauss-jordan':
            case 'rref':
                result = gaussJordan(inputMatrix);
                break;
            case 'determinant':
                result = calculateDeterminant(inputMatrix);
                break;
            case 'inverse':
                result = calculateInverse(inputMatrix);
                break;
            default:
                result = { 
                    steps: [{ description: 'Operation not implemented', matrix: inputMatrix }], 
                    result: { finalMatrix: inputMatrix } 
                };
        }
        
        setSteps(result.steps);
        setSolution(result.result);
    };

    return (
        <div className="App">
            <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />
            
            <div className="container">
                {currentTab === 'solver' && (
                    <>
                        <h1>Linear Algebra Visualization Tool</h1>
                        <OperationSelector 
                            selectedOperation={operation} 
                            onOperationChange={setOperation} 
                        />
                        <MatrixInput onMatrixInput={handleMatrixInput} />
                        {steps.length > 0 && <StepVisualization steps={steps} />}
                        {solution && <SolutionDisplay solution={solution} />}
                    </>
                )}

                {currentTab === 'explanation' && <ExplanationTab />}

                {currentTab === 'about' && (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <h1>About Matrix Solver</h1>
                        <p style={{ maxWidth: '700px', margin: '20px auto', lineHeight: '1.8', fontSize: '18px' }}>
                            Matrix Solver is an educational tool designed to help students and professionals 
                            understand linear algebra concepts through interactive visualization and 
                            step-by-step solutions.
                        </p>
                        <p style={{ marginTop: '30px', color: '#a2624b ', fontSize: '20px', fontWeight: 'bold' }}>
                            Version 1.1.0
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default App;

// for number formatting
// npm install mathjax-full
// npm install @types/mathjax-full --save-dev