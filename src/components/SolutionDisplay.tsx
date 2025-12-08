import React from 'react';
import type { SolutionResult } from '../types/matrix';

interface SolutionDisplayProps {
    solution: SolutionResult;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution }) => {
    const formatNumber = (num: number): string => {
        return Math.abs(num) < 1e-10 ? '0' : num.toFixed(4);
    };

    return (
        <div className="solution-display">
            <h2>Final Solution</h2>
            
            {solution.solution && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Variables:</h3>
                    {solution.solution.map((value, index) => (
                        <div key={index} style={{ fontSize: '18px', margin: '5px 0' }}>
                            x<sub>{index + 1}</sub> = {formatNumber(value)}
                        </div>
                    ))}
                </div>
            )}

            {solution.determinant !== undefined && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Determinant:</h3>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        det = {formatNumber(solution.determinant)}
                    </div>
                </div>
            )}

            <div>
                <h3>Final Matrix:</h3>
                <table style={{ 
                    margin: '10px auto',
                    borderCollapse: 'collapse',
                    border: '2px solid #333'
                }}>
                    <tbody>
                        {solution.finalMatrix.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((value, colIndex) => (
                                    <td 
                                        key={colIndex}
                                        style={{
                                            padding: '10px 15px',
                                            textAlign: 'center',
                                            border: '1px solid #ddd',
                                            fontFamily: 'monospace'
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
        </div>
    );
};

export default SolutionDisplay;