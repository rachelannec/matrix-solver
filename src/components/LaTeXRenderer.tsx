import { useEffect, useRef, useState } from 'react';

interface LaTeXRendererProps {
    latex: string;
    display?: boolean;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ latex, display = false }) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Check if MathJax is ready
        const checkMathJax = setInterval(() => {
            if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
                setIsReady(true);
                clearInterval(checkMathJax);
            }
        }, 100);

        // Cleanup after 5 seconds if MathJax doesn't load
        const timeout = setTimeout(() => {
            clearInterval(checkMathJax);
            if (!window.MathJax) {
                setIsReady(true); // Show fallback
            }
        }, 5000);

        return () => {
            clearInterval(checkMathJax);
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        const renderMath = async () => {
            if (containerRef.current && isReady) {
                if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
                    try {
                        // Clear previous content
                        containerRef.current.innerHTML = display 
                            ? `\\[${latex}\\]` 
                            : `\\(${latex}\\)`;
                        
                        // Typeset the math
                        await window.MathJax.typesetPromise([containerRef.current]);
                    } catch (err) {
                        console.error('MathJax typesetting failed:', err);
                        // Fallback to plain text
                        containerRef.current.textContent = latex;
                    }
                } else {
                    // MathJax not available, show plain text
                    containerRef.current.textContent = latex;
                }
            }
        };

        renderMath();
    }, [latex, display, isReady]);

    if (!isReady) {
        return <span>{latex}</span>;
    }

    return <span ref={containerRef}>{latex}</span>;
};

export default LaTeXRenderer;