interface Window {
    MathJax: {
        typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
        tex2svg: (tex: string) => HTMLElement;
    };
}