/**
 * Mathematical Utilities for LaTeX formatting and mathematical expression detection
 */

/**
 * Converts a mathematical expression to LaTeX format
 * @param {string} expression - The mathematical expression to convert
 * @returns {string} - LaTeX formatted expression
 */
export const convertToLatex = (expression) => {
  let latex = expression;
  
  // Convert fractions
  latex = latex.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}');
  
  // Convert multiplication symbols
  latex = latex.replace(/\*/g, '\\times');
  latex = latex.replace(/×/g, '\\times');
  
  // Convert division symbols
  latex = latex.replace(/÷/g, '\\div');
  
  // Convert addition, subtraction (already good)
  // Handle equals signs (already good)
  
  // Convert powers
  latex = latex.replace(/(\w+)\^(\d+)/g, '$1^{$2}');
  
  // Convert square roots
  latex = latex.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  
  return latex;
};

/**
 * Wraps an expression in LaTeX display mode
 * @param {string} expression - The expression to wrap
 * @returns {string} - Display mode LaTeX
 */
export const wrapInDisplayMode = (expression) => {
  return `\\[${expression}\\]`;
};

/**
 * Wraps an expression in LaTeX inline mode
 * @param {string} expression - The expression to wrap
 * @returns {string} - Inline mode LaTeX
 */
export const wrapInInlineMode = (expression) => {
  return `\\(${expression}\\)`;
};

/**
 * Creates a boxed final answer
 * @param {string} answer - The final answer
 * @returns {string} - Boxed LaTeX expression
 */
export const boxAnswer = (answer) => {
  return `\\boxed{${answer}}`;
};

/**
 * Formats a step-by-step mathematical solution
 * @param {Array} steps - Array of step objects with description and expression
 * @returns {string} - Formatted solution with LaTeX
 */
export const formatStepBySolution = (steps) => {
  let formatted = '';
  
  steps.forEach((step, index) => {
    formatted += `${index + 1}. **${step.description}**\n`;
    
    if (step.expression) {
      const latexExpression = convertToLatex(step.expression);
      formatted += wrapInDisplayMode(latexExpression) + '\n';
    }
    
    formatted += '\n';
  });
  
  return formatted;
};

/**
 * Detects if a string contains mathematical expressions
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if mathematical expressions are detected
 */
export const containsMathematicalExpressions = (text) => {
  const mathPatterns = [
    /\d+\s*[+\-*/×÷]\s*\d+\s*=\s*\d+/,  // Basic operations
    /\\\[[\s\S]*?\\\]/,                    // Display mode LaTeX
    /\\\([\s\S]*?\\\)/,                    // Inline mode LaTeX
    /\$\$[\s\S]*?\$\$/,                    // Display mode with $$
    /\$[^$\n]+\$/,                        // Inline mode with $
    /\\frac\{[^}]+\}\{[^}]+\}/,           // Fractions
    /\\sqrt\{[^}]+\}/,                    // Square roots
    /\\boxed\{[^}]+\}/,                   // Boxed expressions
    /\d+\/\d+/,                          // Simple fractions
    /\([^)]*[+\-*/×÷][^)]*\)\s*=\s*\d+/  // Parenthetical expressions
  ];
  
  return mathPatterns.some(pattern => pattern.test(text));
};

/**
 * Mathematical operation templates for common calculations
 */
export const mathTemplates = {
  addition: (a, b) => ({
    description: `Add ${a} and ${b}:`,
    expression: `${a} + ${b} = ${a + b}`
  }),
  
  subtraction: (a, b) => ({
    description: `Subtract ${b} from ${a}:`,
    expression: `${a} - ${b} = ${a - b}`
  }),
  
  multiplication: (a, b) => ({
    description: `Multiply ${a} and ${b}:`,
    expression: `${a} \\times ${b} = ${a * b}`
  }),
  
  division: (a, b) => ({
    description: `Divide ${a} by ${b}:`,
    expression: `\\frac{${a}}{${b}} = ${a / b}`
  }),
  
  fraction: (numerator, denominator, result) => ({
    description: `Divide the result by ${denominator}:`,
    expression: `\\frac{${numerator}}{${denominator}} = ${result}`
  }),
  
  parentheses: (a, b, operation, result) => ({
    description: `${operation === '+' ? 'Add' : operation === '-' ? 'Subtract' : operation === '*' ? 'Multiply' : 'Divide'} ${a} and ${b}:`,
    expression: `(${a} ${operation === '*' ? '\\times' : operation} ${b}) = ${result}`
  })
};

/**
 * Automatically format mathematical text for better LaTeX rendering
 * @param {string} text - Text containing mathematical expressions
 * @returns {string} - Text with improved mathematical formatting
 */
export const autoFormatMathematicalText = (text) => {
  let formatted = text;
  
  // Improve step formatting by detecting step patterns
  formatted = formatted.replace(/(\d+)\.\s*([^:]+):\s*([^\n]+)/g, (match, step, description, expression) => {
    if (containsMathematicalExpressions(expression)) {
      const latexExpression = convertToLatex(expression);
      return `${step}. **${description}:**\n${wrapInDisplayMode(latexExpression)}`;
    }
    return match;
  });
  
  // Format final answers
  formatted = formatted.replace(/Final Answer:\s*([^\n]+)/gi, (match, answer) => {
    if (containsMathematicalExpressions(answer)) {
      const latexAnswer = convertToLatex(answer);
      return `**Final Answer:**\n${wrapInDisplayMode(boxAnswer(latexAnswer))}`;
    }
    return match;
  });
  
  return formatted;
};

const mathUtils = {
  convertToLatex,
  wrapInDisplayMode,
  wrapInInlineMode,
  boxAnswer,
  formatStepBySolution,
  containsMathematicalExpressions,
  mathTemplates,
  autoFormatMathematicalText
};

export default mathUtils; 