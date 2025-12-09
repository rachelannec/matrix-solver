import '../styles/ExplanationTab.css';

const ExplanationTab: React.FC = () => {
    return (
        <div className="explanation-tab">
            <h1>How to Use Matrix Solver</h1>
            
            <section className="explanation-section">
                <div className="starting-section">
                    <h2>🎯 Getting Started</h2>
                    <p>Matrix Solver helps you solve linear algebra problems with detailed step-by-step explanations.</p>
                    <ol>
                        <li>Select the operation you want to perform</li>
                        <li>Enter your matrix dimensions</li>
                        <li>Input your matrix values</li>
                        <li>Click "Solve Matrix" to see the solution</li>
                    </ol>
                </div>
            </section>

            <section className="explanation-section">
                <h2>📐 Available Operations</h2>
                
                <div className="operation-card">
                    <h3>Gaussian Elimination</h3>
                    <p>Transforms a matrix into <strong>Row Echelon Form (REF)</strong> using forward elimination.</p>
                    <p><strong>Use for:</strong> Solving systems of linear equations</p>
                    <p><strong>Result:</strong> Upper triangular matrix with zeros below the diagonal</p>
                </div>

                <div className="operation-card">
                    <h3>Gauss-Jordan (RREF)</h3>
                    <p>Transforms a matrix into <strong>Reduced Row Echelon Form (RREF)</strong>.</p>
                    <p><strong>Use for:</strong> Finding exact solutions, solving systems completely</p>
                    <p><strong>Result:</strong> Identity matrix on the left side (for augmented matrices)</p>
                </div>

                <div className="operation-card">
                    <h3>Determinant</h3>
                    <p>Calculates the determinant of a square matrix using row operations.</p>
                    <p><strong>Use for:</strong> Checking if a matrix is invertible</p>
                    <p><strong>Result:</strong> A single number (det = 0 means singular/not invertible)</p>
                </div>

                <div className="operation-card">
                    <h3>Matrix Inverse</h3>
                    <p>Finds the inverse of a square matrix using Gauss-Jordan elimination.</p>
                    <p><strong>Use for:</strong> Solving equations of the form Ax = b</p>
                    <p><strong>Result:</strong> Matrix A⁻¹ such that A × A⁻¹ = I</p>
                </div>
            </section>

            <section className="explanation-section">
                <h2>💡 Tips & Tricks</h2>
                <ul className="tips-list">
                    <li>✅ Use fractions for exact results (e.g., 1/3 instead of 0.333)</li>
                    <li>✅ Enable LaTeX rendering for beautiful mathematical notation</li>
                    <li>✅ Navigate through steps to understand each operation</li>
                    <li>✅ For augmented matrices, add an extra column for the constants</li>
                    <li>⚠️ Determinant and Inverse require square matrices</li>
                </ul>
            </section>

            <section className="explanation-section">
                <h2>📚 Example</h2>
                <div className="example-box">
                    <h4>Solving a System of Equations:</h4>
                    <p>For the system:</p>
                    <pre>
x + 2y = 4 <br/>
3x + 4y = 10
                    </pre>
                    <p>Create an augmented matrix:</p>
                    <pre>
[ 1  2 | 4 ] <br/>
[ 3  4 | 10]
                    </pre>
                    <p>Then use <strong>Gauss-Jordan</strong> to get:</p>
                    <pre>
[ 1  0 | 2 ]  → x = 2 <br/>
[ 0  1 | 1 ]  → y = 1
                    </pre>
                </div>
            </section>
        </div>
    );
};

export default ExplanationTab;