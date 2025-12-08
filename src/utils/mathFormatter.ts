export const formatNumber = (num: number, decimals: number = 4): string => {
    // handle very small number as zero
    if(Math.abs(num) < 1e-10){
        return '0';
    }

    // check if number is an integer
    if(Number.isInteger(num)){
        return num.toString();
    }

    // check if it's close to a fraction
    const fraction = toFraction(num);
    if(fraction){
        return fraction;
    }

    // otherwaise, return fixed decimal with specified precision
    return num.toFixed(decimals).replace(/\.?0+$/, '');
}

// convert to fraction (if possible)
export const toFraction = (decimal: number, tolerance: number = 1e-6): string | null => {
    if (Math.abs(decimal) < tolerance ) return '0';

    const sign = decimal < 0 ? '-' : '';
    decimal = Math.abs(decimal);

    // try common denominators up to 100
    for (let denominator = 1; denominator <= 100; denominator++){
        const numerator = Math.round(decimal *denominator);
        if(Math.abs(decimal - numerator / denominator) < tolerance){
            if(denominator === 1){
                return null; // it's an integer, handled elsewhere
            }
            // simplify fraction
            const gcd = getGCD(numerator, denominator);
            const simplifiedNum = numerator / gcd;
            const simplifiedDen = denominator / gcd;

            if(simplifiedDen === 1){
                return null;
            }

            return `${sign}${simplifiedNum}/${simplifiedDen}`;
        }
    }
    return null; // no suitable fraction found
};

// gcd
const getGCD = (a: number, b: number): number => {
    return b === 0 ? a : getGCD(b, a % b);
}

// format matrix as LaTex
export const matrixToLatex = (matrix: number[][]): string => {
    const rows = matrix.map(row => 
        row.map(val => formatNumber(val, 3)).join(' & ')
    ).join(' \\\\ ');
    
    return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
};

// format equation as LaTex
export const equationToLatex = (coefficients: number[], result: number, variable: string = 'x'): string => {
    const terms = coefficients.map((coef, index) =>{
        if (Math.abs(coef) < 1e-10) return ''; // skip zero coefficients

        const sign = coef < 0 ? '-' : '+';
        const absCoef = Math.abs(coef);
        const coefStr = absCoef === 1 ? '' : formatNumber(absCoef);

        return `${sign} ${coefStr}${variable}_{${index + 1}} `;
    }).filter(term => term !== '').join(' ');

    return `${terms.replace(/^\+ /, '')} = ${formatNumber(result)}`;
}