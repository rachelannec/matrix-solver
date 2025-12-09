import { useState } from 'react';
import '../styles/Navbar.css';

interface NavbarProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
    const [isMenuOpen, setIsMenuOpen] =useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon"> <img src="icon.png" alt="Icon" /> </span>
                    <span className="brand-name">Matrix Solver</span>
                </div>

                <button 
                    className="navbar-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <button
                        className={`nav-item ${currentTab === 'solver' ? 'active' : ''}`}
                        onClick={() => {
                            onTabChange('solver');
                            setIsMenuOpen(false);
                        }}
                    >
                        <span className="nav-icon">⚙️</span>
                        Solver
                    </button>
                    <button
                        className={`nav-item ${currentTab === 'explanation' ? 'active' : ''}`}
                        onClick={() => {
                            onTabChange('explanation');
                            setIsMenuOpen(false);
                        }}
                    >
                        <span className="nav-icon">📚</span>
                        Explanation
                    </button>
                    <button
                        className={`nav-item ${currentTab === 'about' ? 'active' : ''}`}
                        onClick={() => {
                            onTabChange('about');
                            setIsMenuOpen(false);
                        }}
                    >
                        <span className="nav-icon">ℹ️</span>
                        About
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;