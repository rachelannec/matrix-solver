import { useEffect, useRef } from 'react';

interface LaTeXRendererProps {
    latex: string;
    display?: boolean;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ latex, display = false}) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if(containerRef.current && window.MathJax) {
            // clear previous content
            containerRef.current.innerHTML = display
                ? `\\[${latex}\\]` 
                : `\\(${latex})\\`;
            
            // typeset the math
            window.MathJax.typesetPromise([containerRef.current]).catch((err: Error) =>
                console.error('MathJax typeset failed: ', err)
            );
        }
    }, [latex, display]);

    return <span ref={containerRef}></span>
}

export default LaTeXRenderer;