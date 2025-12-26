import { useState } from 'react';
import type { Step } from '../types/matrix';
import { formatNumber } from '../utils/mathFormatter';
import LaTeXRenderer from './LaTeXRenderer';

interface StepVisualizationProps {
    steps: Step[];
}

const StepVisualization: React.FC<StepVisualizationProps> = ({ steps }) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [useLatex, setUseLatex] = useState<boolean>(true);

    // Helper function to parse description and render LaTeX inline
    const renderDescription = (description: string) => {
        if (!description || description.trim() === '') {
            return <div style={{ fontStyle: 'italic', color: '#222' }}>No description available</div>;
        }

        if (!useLatex) {
            return <div style={{ whiteSpace: 'pre-line' }}>{description}</div>;
        }

        // Split by LaTeX delimiters $...$ for inline math
        const parts = description.split(/(\$[^$]+\$)/g);
        
        return (
            <div style={{ whiteSpace: 'pre-line' }}>
                {parts.map((part, index) => {
                    if (part.startsWith('$') && part.endsWith('$')) {
                        // Extract LaTeX content (remove the $ delimiters)
                        const latex = part.slice(1, -1);
                        return (
                            <span key={index} style={{ display: 'inline-block', margin: '0 4px', verticalAlign: 'middle' }}>
                                <LaTeXRenderer latex={latex} />
                            </span>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        );
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
                                        ? '#6561478b' 
                                        : 'transparent',
                                    transition: 'background-color 0.3s'
                                }}
                            >
                                {row.map((value, colIndex) => (
                                    <td 
                                        key={colIndex}
                                        style={{
                                            padding: '10px 15px',
                                            textAlign: 'center',
                                            minWidth: '70px',
                                            fontFamily: 'monospace',
                                            fontSize: '16px',
                                            fontWeight: highlightedRows?.includes(rowIndex) ? 'bold' : 'normal'
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

    // Safety check - return null if no steps or invalid currentStep
    if (steps.length === 0 || !steps[currentStep]) {
        return null;
    }

    return (
        <div className="step-visualization">
            <h2>Solution Steps</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '20px', cursor: 'pointer', color: '#eee' }}>
                    <input 
                        type="checkbox" 
                        checked={useLatex}
                        onChange={(e) => setUseLatex(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    {' '}Use LaTeX Rendering
                </label>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="button"
                    style={{ marginRight: '10px' }}
                >
                    ← Previous
                </button>
                
                <span style={{ 
                    margin: '0 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#eee'
                }}>
                    Step {currentStep + 1} of {steps.length}
                </span>
                
                <button 
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={currentStep === steps.length - 1}
                    className="button"
                >
                    Next →
                </button>
            </div>

            <div style={{ 
                backgroundColor: '#f5f5f5',
                border: '2px solid #ddd',
                borderRadius: '8px',
                padding: '25px',
                minHeight: '250px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ color: '#cda95cff', marginBottom: '15px' }}>
                    Step {currentStep + 1}
                </h3>
                <div style={{ 
                    fontSize: '16px', 
                    marginBottom: '20px',
                    color: '#333',
                    lineHeight: '1.8',
                    minHeight: '40px'
                }}>
                    {renderDescription(steps[currentStep].description)}
                </div>
                {renderMatrix(steps[currentStep].matrix, steps[currentStep].highlightedRows)}
            </div>

            <div style={{ marginTop: '25px' }}>
                <h4 style={{ marginBottom: '10px', color: '#eee'}}>All Steps:</h4>
                <ol style={{ 
                    textAlign: 'left', 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    backgroundColor: '#fafafa',
                    padding: '15px 15px 15px 35px',
                    borderRadius: '5px',
                    border: '1px solid #e0e0e0'
                }}>
                    {steps.map((step, index) => {
                        // Get first line of description, removing LaTeX
                        const preview = step.description
                            .replace(/\$[^$]+\$/g, '')
                            .split('\n')
                            .filter(line => line.trim() !== '')
                            [0] || 'Step ' + (index + 1);

                        return (
                            <li 
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                style={{ 
                                    cursor: 'pointer',
                                    padding: '8px 10px',
                                    backgroundColor: index === currentStep ? '#e3f2fd' : 'transparent',
                                    marginBottom: '5px',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s',
                                    borderLeft: index === currentStep ? '3px solid #667eea' : '3px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    if (index !== currentStep) {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (index !== currentStep) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                {preview}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
};

export default StepVisualization;