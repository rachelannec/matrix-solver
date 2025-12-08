import React, { useState } from 'react';
import type { Step } from '../types/matrix';

interface StepVisualizationProps {
    steps: Step[];
}

const StepVisualization: React.FC<StepVisualizationProps> = ({ steps }) => {
    const [currentStep, setCurrentStep] = useState<number>(0);

    const formatNumber = (num: number): string => {
        return Math.abs(num) < 1e-10 ? '0' : num.toFixed(3);
    };

    const renderMatrix = (matrix: number[][], highlightedRows?: number[]) => {
        return (
            <div style={{ 
                display: 'inline-block', 
                border: '2px solid #333',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px 0'
            }}>
                <table style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                        {matrix.map((row, rowIndex) => (
                            <tr 
                                key={rowIndex}
                                style={{
                                    backgroundColor: highlightedRows?.includes(rowIndex) 
                                        ? '#ffffcc' 
                                        : 'transparent'
                                }}
                            >
                                {row.map((value, colIndex) => (
                                    <td 
                                        key={colIndex}
                                        style={{
                                            padding: '8px 12px',
                                            textAlign: 'center',
                                            minWidth: '60px',
                                            fontFamily: 'monospace',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {formatNumber(value)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (steps.length === 0) {
        return null;
    }

    return (
        <div className="step-visualization">
            <h2>Solution Steps</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="button"
                    style={{ marginRight: '10px' }}
                >
                    Previous
                </button>
                
                <span style={{ margin: '0 10px' }}>
                    Step {currentStep + 1} of {steps.length}
                </span>
                
                <button 
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={currentStep === steps.length - 1}
                    className="button"
                >
                    Next
                </button>
            </div>

            <div style={{ 
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '20px',
                minHeight: '200px'
            }}>
                <h3>Step {currentStep + 1}</h3>
                <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                    {steps[currentStep].description}
                </p>
                {renderMatrix(steps[currentStep].matrix, steps[currentStep].highlightedRows)}
            </div>

            <div style={{ marginTop: '20px' }}>
                <h4>All Steps:</h4>
                <ol style={{ textAlign: 'left', maxHeight: '200px', overflowY: 'auto' }}>
                    {steps.map((step, index) => (
                        <li 
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            style={{ 
                                cursor: 'pointer',
                                padding: '5px',
                                backgroundColor: index === currentStep ? '#e7f3fe' : 'transparent',
                                marginBottom: '5px'
                            }}
                        >
                            {step.description}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default StepVisualization;