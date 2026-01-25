# Changelog

All notable changes to the Matrix Solver project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
---
## [v1.2.3] - 2026-01-25 - Better Step Description
### Enhance
- **Steps Description**
  - More detailed explanations on what's happening and why 

---
## [v1.2.2] - 2026-01-22 - Fix Mobile Styling
### Fixed
- **Mobile Display**
  - Content is not horizontally scrolling (again yes)
  - Incorrect padding and styling

### Nakaw Background
- **Square Background**
  - From here: https://www.reactbits.dev/backgrounds/squares 

--- 
## [v1.2.1] - 2026-01-22 - New Background

### Nakaw Background
- **Square Background**
  - From here: https://www.reactbits.dev/backgrounds/squares 


---
## [v1.2.0] - 2026-01-22 - Algorithm Improvements & Responsive Design

### Added
- **Enhanced Gaussian Elimination Algorithm**
  - Partial pivoting for improved numerical stability
  - Better handling of singular and inconsistent systems
  - Detection of infinite solutions (free variables)
  - Epsilon tolerance (1e-10) for floating-point precision
  - Clear error messages for inconsistent systems (0 = b)
  
- **Solution State Detection**
  - `hasUniqueSolution` flag for systems with one solution
  - `hasInfiniteSolutions` flag for underdetermined systems
  - `hasNoSolution` flag for inconsistent systems
  - Proper rank calculation and free variable counting

- **Inverse Matrix Error Handling**
  - Clear error messages for singular matrices
  - Validation that matrix determinant ≠ 0
  - Explanation of why inverse doesn't exist
  - Proper undefined return for non-invertible matrices

- **Responsive Design Enhancements**
  - Two-column layout for desktop/laptop (≥1024px)
  - Single-column layout for mobile and tablet
  - Sticky input column on desktop for better UX
  - Horizontal scrolling for large matrices
  - Vertical scrolling with max-height constraints

### Changed
- **Matrix Display**
  - Input matrix grid now horizontally scrollable
  - Step visualization matrices scroll independently
  - Mobile-optimized touch scrolling
  - Improved overflow handling for all screen sizes

- **Layout Structure**
  - Reorganized App.tsx with two-column grid layout
  - Left column: Operation selector + Matrix input (sticky on desktop)
  - Right column: Solution steps + Final answer
  - Responsive breakpoints at 768px and 1024px

- **Solution Display Component**
  - Error-first rendering (checks for errors before displaying results)
  - Better error styling with red-themed alerts
  - Improved visual hierarchy for different result types
  - Clear distinction between unique, infinite, and no solutions

### Fixed
- **Type Safety**
  - Added missing properties to `SolutionResult` interface:
    - `hasUniqueSolution?: boolean`
    - `hasInfiniteSolutions?: boolean`
    - `hasNoSolution?: boolean`
    - `inverse?: number[][]`
    - `error?: string`
  
- **Algorithm Correctness**
  - Fixed unique solution detection logic (rank === numVariables)
  - Corrected back substitution to only run for unique solutions
  - Fixed inconsistency detection in row echelon form
  - Improved zero-row handling in Gaussian elimination

- **UI/UX Issues**
  - Restored step descriptions in visualization
  - Fixed matrix input scrolling behavior
  - Prevented input column from scrolling with page
  - Improved mobile responsiveness

### Improved
- **Code Quality**
  - Better separation of concerns in components
  - More descriptive variable names
  - Enhanced error handling throughout
  - Cleaner conditional rendering logic

- **User Experience**
  - Clearer error messages for invalid operations
  - Better feedback for singular matrices
  - Improved step-by-step explanations
  - More intuitive desktop layout
  
---

## [v1.1.0] - 2024-12-26 - Documentation & UI Enhancements

### Added
- **Comprehensive inline documentation** in `matrixOperations.ts`
  - Detailed explanations for all core mathematical operations
  - Visual examples and mathematical notation for key algorithms
  - Step-by-step breakdowns of Gaussian Elimination, Gauss-Jordan, Determinant, and Inverse calculations
  - Helper function documentation explaining tolerance handling and floating-point precision
  - Algorithm complexity notes and efficiency explanations
  - Educational comments covering mathematical concepts and practical applications

<!-- - **Enhanced code documentation** in validator and formatter utilities
  - Detailed comments in `matrixValidator.ts`
  - Comprehensive explanations in `mathFormatter.ts` -->

### Changed
- **Navbar improvements**
  - Removed icons for cleaner, more minimalist appearance
  - Streamlined navigation interface
  
- **Matrix visualization enhancements**
  - Removed `matrixToLatex` conversion in `renderMatrix` function
  - Improved matrix display clarity and readability
  - Better step-by-step visualization

### Improved
- Code readability with structured comment blocks
- Learning experience for developers new to linear algebra
- Understanding of mathematical-to-code translation
- Developer onboarding with detailed inline documentation

---

## [v1.0.0] - 2024-12-09 - Initial Release

🎉 First public release of Matrix Solver!

**Live Demo:** https://matrix-solver-nexus.vercel.app/

### Features
- **Matrix Input Interface**
  - Dynamic grid with adjustable dimensions (2×2 to 8×8)
  - Real-time input validation
  - Support for both coefficient and augmented matrices

- **Core Matrix Operations**
  - Gaussian Elimination (Row Echelon Form)
  - Gauss-Jordan Elimination (Reduced Row Echelon Form)
  - Determinant Calculation
  - Matrix Inverse

- **Step-by-Step Visualization**
  - Detailed solution steps with descriptions
  - LaTeX rendering for mathematical notation
  - Row highlighting for current operations
  - Clean, professional presentation

- **User Interface**
  - Responsive design for all screen sizes
  - Tabbed interface (Solver / Explanation)
  - Dark theme with modern aesthetics
  - Footer with developer information

- **Educational Features**
  - Explanation tab with usage guide
  - Mathematical notation and formulas
  - Clear operation descriptions

### Technical Stack
- React 18 with TypeScript
- Vite for build tooling
- MathJax for LaTeX rendering
- CSS3 for styling
- ESLint for code quality