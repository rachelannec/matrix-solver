import '../styles/Footer.css';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>Matrix Solver</h3>
                    <p>A powerful tool for solving linear algebra problems with step-by-step visualization.</p>
                </div>

                <div className="footer-section">
                    <h4>Features</h4>
                    <ul>
                        <li>Gaussian Elimination</li>
                        <li>Gauss-Jordan (RREF)</li>
                        <li>Determinant Calculation</li>
                        <li>Matrix Inverse</li>
                    </ul>
                </div>

                {/* <div className="footer-section">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="#" onClick={(e) => e.preventDefault()}>Documentation</a></li>
                        <li><a href="#" onClick={(e) => e.preventDefault()}>Examples</a></li>
                        <li><a href="#" onClick={(e) => e.preventDefault()}>Tutorial</a></li>
                        <li><a href="#" onClick={(e) => e.preventDefault()}>FAQ</a></li>
                    </ul>
                </div> */}

                <div className="footer-section">
                    <h4>Connect</h4>
                    <div className="social-links">
                        <a href="#" onClick={(e) => e.preventDefault()} aria-label="GitHub">
                            <i className="fa-brands fa-github fa-lg"></i>
                        </a>
                        <a href="#" onClick={(e) => e.preventDefault()} aria-label="Email">
                            <i className="fa-solid fa-envelope fa-lg"></i>
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} Matrix Solver. All rights reserved.</p>
                <p>Built with React & TypeScript | Powered by MathJax</p>
            </div>
        </footer>
    );
};

export default Footer;