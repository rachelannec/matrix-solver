import React from 'react';

interface OperationSelectorProps {
    selectedOperation: string;
    onOperationChange: (operation: string) => void;
}

const OperationSelector: React.FC<OperationSelectorProps> = ({ 
    selectedOperation, 
    onOperationChange 
}) => {
    const operations = [
        { value: 'gaussian-elimination', label: 'Gaussian Elimination' },
        { value: 'gauss-jordan', label: 'Gauss-Jordan (RREF)' },
        { value: 'determinant', label: 'Determinant' },
        { value: 'inverse', label: 'Matrix Inverse' },
    ];

    return (
        <div className="operation-selector">
            <h2>Select Operation</h2>
            <select 
                value={selectedOperation}
                onChange={(e) => onOperationChange(e.target.value)}
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    minWidth: '200px'
                }}
            >
                {operations.map((operation) => (
                    <option key={operation.value} value={operation.value}>
                        {operation.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default OperationSelector;