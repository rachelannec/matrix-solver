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

                <div className="footer-section">
                    <h4>Note</h4>
                    <p>If you identified an error or have a suggestion/feedback, feel free to contact me. 😎</p>
                </div>

                <div className="footer-section">
                    <h4>Connect</h4>
                    <div className="social-links">
                        <a 
                        href={"https://github.com/rachelannec/matrix-solver" }
                        target='_blank'
                        aria-label="GitHub"
                        title='View source code on Github'
                        >
                            <i className="fa-brands fa-github fa-lg"></i>
                        </a>

                        <a 
                        href={"https://x.com/_rachelannec" }
                        target='_blank'
                        aria-label="X (Twitter)"
                        title='Me on X (Twitter)'
                        >
                            <i className="fa-brands fa-x-twitter fa-lg"></i>
                        </a>

                        <a href="mailto:rachelannecilon.work@gmail.com" 
                        target='_blank'
                        aria-label="Email"
                        title='Send me an email'>
                            <i className="fa-solid fa-envelope fa-lg"></i>
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} Matrix Solver. All rights reserved.</p>
                <p>
                    Built with React & TypeScript | Powered by MathJax
                    <br />
                    <small>
                        Developed by <a 
                            href="https://github.com/rachelannec" 
                            target="_blank" 
                            rel="noopener noreferrer"
                           >
                            Rachel
                        </a>
                    </small>
                </p>
            </div>
        </footer>
    );
};

export default Footer;