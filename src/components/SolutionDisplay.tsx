import type { SolutionResult } from '../types/matrix';
import { formatNumber, matrixToLatex } from '../utils/mathFormatter';
import LaTeXRenderer from './LaTeXRenderer';

interface SolutionDisplayProps {
    solution: SolutionResult;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution }) => {
    // Check for error first - before rendering anything else
    if (solution.error) {
        return (
            <div className="solution-display">
                <h2>❌ Error</h2>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#ffebee', 
                    borderLeft: '4px solid #d32f2f',
                    borderRadius: '8px',
                    color: '#c62828',
                    fontSize: '18px',
                    fontWeight: '500',
                    marginTop: '20px'
                }}>
                    {solution.error}
                </div>
            </div>
        );
    }

    return (
        <div className="solution-display">
            <h2>Final Solution</h2>
            
            {solution.solution && (
                <div style={{ 
                    marginBottom: '25px',
                    padding: '20px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    border: '2px solid #4caf50'
                }}>
                    <h3 style={{ color: '#2e7d32', marginBottom: '15px' }}>Variables:</h3>
                    {solution.solution.map((value, index) => (
                        <div key={index} style={{ 
                            fontSize: '20px', 
                            margin: '10px 0',
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            <LaTeXRenderer latex={`x_{${index + 1}} = ${formatNumber(value)}`} />
                        </div>
                    ))}
                </div>
            )}

            {solution.determinant !== undefined && (
                <div style={{ 
                    marginBottom: '25px',
                    padding: '20px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '8px',
                    border: '2px solid #ff9800'
                }}>
                    <h3 style={{ color: '#e65100', marginBottom: '10px' }}>Determinant:</h3>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                            det(A) = {formatNumber(solution.determinant)}
                        </div>
                    </div>
                </div>
            )}

            {solution.inverse && (
                <div style={{ 
                    marginBottom: '25px',
                    padding: '20px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    border: '2px solid #2196f3'
                }}>
                    <h3 style={{ color: '#1565c0', marginBottom: '15px' }}>Inverse Matrix (A⁻¹):</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <LaTeXRenderer latex={matrixToLatex(solution.inverse)} display={true} />
                    </div>
                </div>
            )}

            <div style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px'
            }}>
                <h3 style={{ marginBottom: '15px' }}>Final Matrix:</h3>
                <div style={{ overflowX: 'auto' }}>
                    <LaTeXRenderer latex={matrixToLatex(solution.finalMatrix)} display={true} />
                </div>
            </div>
        </div>
    );
};

export default SolutionDisplay;