import { useState } from 'react';
import Navbar from './components/Navbar';
// import Footer from './components/Footer';
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
                        <div className="solver-layout">
                            {/* Left Column: Input */}
                            <div className="input-column">
                                <OperationSelector 
                                    selectedOperation={operation} 
                                    onOperationChange={setOperation} 
                                />
                                <MatrixInput onMatrixInput={handleMatrixInput} />
                            </div>

                            {/* Right Column: Steps & Solution */}
                            <div className="output-column">
                                {steps.length > 0 ? (
                                    <>
                                        <StepVisualization steps={steps} />
                                        {solution && <SolutionDisplay solution={solution} />}
                                    </>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '400px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                        padding: '60px 40px',
                                        textAlign: 'center',
                                        border: '2px dashed rgba(255, 255, 255, 0.2)'
                                    }}>
                                        <div style={{
                                            fontSize: '72px',
                                            marginBottom: '20px',
                                            opacity: 0.3
                                        }}>
                                            📊
                                        </div>
                                        <h2 style={{ 
                                            color: '#aaa', 
                                            marginBottom: '15px',
                                            fontSize: '28px',
                                            fontWeight: '500'
                                        }}>
                                            Ready to Solve
                                        </h2>
                                        <p style={{ 
                                            color: '#888', 
                                            fontSize: '16px',
                                            lineHeight: '1.6',
                                            maxWidth: '500px'
                                        }}>
                                            Enter your matrix values on the left, select an operation, 
                                            and click <strong style={{ color: '#667eea' }}>Solve</strong> to see 
                                            step-by-step solutions appear here.
                                        </p>
                                        <div style={{
                                            marginTop: '30px',
                                            padding: '15px 25px',
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(102, 126, 234, 0.3)'
                                        }}>
                                            <p style={{ 
                                                color: '#667eea', 
                                                fontSize: '14px',
                                                margin: 0,
                                                fontWeight: '500'
                                            }}>
                                                💡 Tip: Start with a simple 3×3 matrix to get familiar
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
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
                        <p style={{ marginTop: '30px', color: '#a2624b', fontSize: '20px', fontWeight: 'bold' }}>
                            Version 1.2.0
                        </p>
                    </div>
                )}
            </div>

            {/* <Footer /> */}
        </div>
    );
}

export default App;

// for number formatting
// npm install mathjax-full
// npm install @types/mathjax-full --save-dev