import React, { useState } from 'react';

interface MatrixInputProps {
    onMatrixInput: (matrix: number[][]) => void;
}

const MatrixInput: React.FC<MatrixInputProps> = ({ onMatrixInput }) => {
    const [rows, setRows] = useState<number>(3);
    const [cols, setCols] = useState<number>(3);
    const [matrixValues, setMatrixValues] = useState<string[][]>(
        Array(3).fill(null).map(() => Array(3).fill(''))
    );
    const [error, setError] = useState<string>('');

    const handleDimensionChange = (newRows: number, newCols: number) => {
        setRows(newRows);
        setCols(newCols);
        // Initialize matrix with empty strings
        const newMatrix = Array(newRows).fill(null).map(() => Array(newCols).fill(''));
        setMatrixValues(newMatrix);
        setError('');
    };

    const handleCellChange = (row: number, col: number, value: string) => {
        const newMatrix = matrixValues.map(r => [...r]);
        newMatrix[row][col] = value;
        setMatrixValues(newMatrix);
        setError('');
    };

    const parseMatrix = (): number[][] | null => {
        const result: number[][] = [];
        
        for (let i = 0; i < rows; i++) {
            const row: number[] = [];
            for (let j = 0; j < cols; j++) {
                const value = parseFloat(matrixValues[i][j]);
                if (isNaN(value) || matrixValues[i][j].trim() === '') {
                    setError(`Invalid value at row ${i + 1}, column ${j + 1}`);
                    return null;
                }
                row.push(value);
            }
            result.push(row);
        }
        
        return result;
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const matrix = parseMatrix();
        
        if (matrix) {
            onMatrixInput(matrix);
            setError('');
        }
    };

    const handleClear = () => {
        setMatrixValues(Array(rows).fill(null).map(() => Array(cols).fill('')));
        setError('');
    };

    return (
        <div className="matrix-input">
            <h2>Input Matrix</h2>
            
            <div style={{ marginBottom: '20px', color: '#ddd' }}>
                <label>
                    Rows: 
                    <select 
                        value={rows} 
                        onChange={(e) => handleDimensionChange(parseInt(e.target.value), cols)}
                        style={{ marginLeft: '10px', marginRight: '20px' }}
                    >
                        {[2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
                
                <label>
                    Columns: 
                    <select 
                        value={cols} 
                        onChange={(e) => handleDimensionChange(rows, parseInt(e.target.value))}
                        style={{ marginLeft: '10px' }}
                    >
                        {[2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${cols}, 70px)`,
                    gap: '5px',
                    marginBottom: '20px',
                    justifyContent: 'center'
                }}>
                    {matrixValues.map((row, rowIndex) => (
                        row.map((value, colIndex) => (
                            <input
                                key={`${rowIndex}-${colIndex}`}
                                type="text"
                                value={value}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                placeholder="0"
                                style={{
                                    width: '60px',
                                    height: '40px',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        ))
                    ))}
                </div>
                
                {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button type="submit" className="button">Solve</button>
                    <button type="button" onClick={handleClear} className="button">Clear</button>
                </div>
            </form>
        </div>
    );
};

export default MatrixInput;