import mathUtils from '../../../utils/mathUtils';

/**
 * ContentFormatter Utility
 * 
 * Handles text formatting including:
 * - Mathematical expressions
 * - Lists (ordered and unordered)
 * - Inline code
 * - Bold text
 * - LaTeX expressions
 */
class ContentFormatter {
  
  /**
   * Main processing function for text formatting
   */
  static processFormatting(text) {
    let processedText = text;

    // Normalize whitespace and reduce excessive newlines
    processedText = processedText.replace(/\n{3,}/g, '\n\n');
    processedText = processedText.replace(/^\s+|\s+$/g, '');
    
    // Process LaTeX mathematical expressions first
    processedText = this.processMathematicalExpressions(processedText);
    
    // Process numbered sections and lists
    processedText = this.processLists(processedText);
    
    // Process inline code
    processedText = processedText.replace(/(?<!`)`([^`\n]+)`(?!`)/g, function(match, code) {
      code = code.trim();
      return '<code class="code-inline">' + code + '</code>';
    });
    
    // Process bold text
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Final cleanup
    processedText = processedText.replace(/(<\/div>)\s*\n{2,}\s*(<div)/g, '$1\n$2');
    processedText = processedText.replace(/\n{2,}/g, '\n');
    processedText = processedText.replace(/\n\s*<div class="latex-display-equation">/g, '<div class="latex-display-equation">');
    processedText = processedText.replace(/<\/div>\s*\n\s*/g, '</div>');
    
    return processedText;
  }

  /**
   * Process mathematical expressions with LaTeX
   */
  static processMathematicalExpressions(text) {
    let processedText = text;
    
    // Process display equations
    processedText = processedText.replace(/\\\[([\s\S]*?)\\\]/g, (match, equation) => {
      const formattedEquation = this.formatMathematicalExpression(equation.trim());
      return `<div class="latex-display-equation">${formattedEquation}</div>`;
    });
    
    processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
      const formattedEquation = this.formatMathematicalExpression(equation.trim());
      return `<div class="latex-display-equation">${formattedEquation}</div>`;
    });
    
    // Process inline equations
    processedText = processedText.replace(/\\\((.*?)\\\)/g, (match, equation) => {
      const formattedEquation = this.formatMathematicalExpression(equation.trim());
      return `<span class="latex-inline-equation">${formattedEquation}</span>`;
    });
    
    processedText = processedText.replace(/\$([^$\n]+)\$/g, (match, equation) => {
      const formattedEquation = this.formatMathematicalExpression(equation.trim());
      return `<span class="latex-inline-equation">${formattedEquation}</span>`;
    });
    
    // Common mathematical patterns
    processedText = this.processCommonMathPatterns(processedText);
    
    return processedText;
  }

  /**
   * Process common mathematical patterns
   */
  static processCommonMathPatterns(text) {
    let processedText = text;
    
    // Pattern for expressions like "(50 + 90) = 140"
    processedText = processedText.replace(/\(\s*(\d+)\s*\+\s*(\d+)\s*\)\s*=\s*(\d+)/g, 
      (match, num1, num2, result) => {
        return `<span class="latex-inline-equation">(${num1} + ${num2}) = ${result}</span>`;
      });
    
    // Pattern for expressions like "148 / 2 = 70"
    processedText = processedText.replace(/(\d+)\s*\/\s*(\d+)\s*=\s*(\d+)/g, 
      (match, numerator, denominator, result) => {
        return `<span class="latex-inline-equation"><span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span> = ${result}</span>`;
      });
    
    // Basic arithmetic patterns
    processedText = processedText.replace(/(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/g, 
      (match, num1, num2, result) => {
        return `<span class="latex-inline-equation">${num1} + ${num2} = ${result}</span>`;
      });
    
    processedText = processedText.replace(/(\d+)\s*-\s*(\d+)\s*=\s*(\d+)/g, 
      (match, num1, num2, result) => {
        return `<span class="latex-inline-equation">${num1} - ${num2} = ${result}</span>`;
      });
    
    processedText = processedText.replace(/(\d+)\s*[*×]\s*(\d+)\s*=\s*(\d+)/g, 
      (match, num1, num2, result) => {
        return `<span class="latex-inline-equation">${num1} × ${num2} = ${result}</span>`;
      });
    
    // Mathematical expressions in numbered steps
    processedText = processedText.replace(/(\d+)\.\s*([^:]+):\s*([^\n]*(?:\d+\s*[+\-*/×÷=]\s*\d+[^\n]*))/g, 
      (match, stepNum, description, expression) => {
        if (mathUtils.containsMathematicalExpressions(expression)) {
          const formattedExpression = this.formatMathematicalExpression(expression);
          return `${stepNum}. **${description}:**<div class="latex-display-equation">${formattedExpression}</div>`;
        }
        return match;
      });
    
    // Final Answer sections
    processedText = processedText.replace(/Final Answer:\s*([^\n]+)/gi, (match, answer) => {
      if (mathUtils.containsMathematicalExpressions(answer)) {
        const formattedAnswer = this.formatMathematicalExpression(answer);
        return `**Final Answer:**<div class="latex-display-equation">${formattedAnswer}</div>`;
      }
      return match;
    });
    
    return processedText;
  }

  /**
   * Format mathematical expressions
   */
  static formatMathematicalExpression(expression) {
    let formatted = expression;
    
    // Replace operators
    formatted = formatted.replace(/\*/g, '×');
    formatted = formatted.replace(/\\div/g, '÷');
    
    // Format fractions
    formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, numerator, denominator) => {
      return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
    });
    
    // Simple fractions
    formatted = formatted.replace(/(\d+)\/(\d+)/g, (match, numerator, denominator) => {
      return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
    });
    
    // Boxed expressions
    formatted = formatted.replace(/\\boxed\{([^}]+)\}/g, (match, content) => {
      return `<span class="boxed-result">${content}</span>`;
    });
    
    // Square roots
    formatted = formatted.replace(/\\sqrt\{([^}]+)\}/g, (match, content) => {
      return `<span class="sqrt">√<span class="sqrt-content">${content}</span></span>`;
    });
    
    // Superscripts and subscripts
    formatted = formatted.replace(/\^(\d+)/g, (match, exponent) => {
      return `<sup>${exponent}</sup>`;
    });
    
    formatted = formatted.replace(/_(\d+)/g, (match, subscript) => {
      return `<sub>${subscript}</sub>`;
    });
    
    return formatted;
  }

  /**
   * Process lists (ordered and unordered)
   */
  static processLists(text) {
    let processedText = text;
    
    // Process numbered sections with bold titles
    const numberedSectionPattern = /(?:^|\n)(\d+)\.\s+(\*\*[^*]+\*\*:)/gm;
    const sections = [];
    const matches = [...processedText.matchAll(numberedSectionPattern)];
    
    if (matches.length > 0) {
      // Process numbered sections with bullet points
      if (matches[0].index > 0) {
        const beforeText = processedText.slice(0, matches[0].index).trim();
        if (beforeText) {
          sections.push({ type: 'text', content: beforeText });
        }
      }
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const nextMatch = matches[i + 1];
        
        const number = match[1];
        const title = match[2].replace(/\*\*/g, '');
        
        const sectionStart = match.index + match[0].length;
        const sectionEnd = nextMatch ? nextMatch.index : processedText.length;
        const sectionContent = processedText.slice(sectionStart, sectionEnd).trim();
        
        let listHtml = '<div class="custom-ordered-list">';
        listHtml += '<div class="custom-list-item">';
        listHtml += `<span class="item-number">${number}.</span>`;
        listHtml += `<div class="item-content"><strong>${title}</strong>`;
        
        if (sectionContent) {
          const bulletPoints = sectionContent.split(/\n\s*-\s+/).filter(item => item.trim() && !item.match(/^\d+\./));
          if (bulletPoints.length > 0) {
            const filteredBullets = bulletPoints.slice(bulletPoints[0].trim() === '' ? 1 : 0);
            
            if (filteredBullets.length > 0) {
              listHtml += '<ul class="message-ul">';
              filteredBullets.forEach(bullet => {
                const cleanBullet = bullet.trim();
                if (cleanBullet && !cleanBullet.match(/^\d+\./)) {
                  listHtml += `<li class="message-li">${cleanBullet}</li>`;
                }
              });
              listHtml += '</ul>';
            }
          }
        }
        
        listHtml += '</div></div></div>';
        sections.push({ type: 'list', content: listHtml });
      }
      
      processedText = sections.map(section => section.content).join('\n');
    } else {
      // Process simple numbered lists
      const simpleNumberedPattern = /(\d+)\.\s+([^\n]+(?:\n\s*-\s+[^\n]+)*)/g;
      
      processedText = processedText.replace(simpleNumberedPattern, (match, number, content) => {
        const lines = content.split('\n');
        const mainItem = lines[0];
        
        let listHtml = '<div class="custom-ordered-list">';
        const subItems = lines.slice(1).filter(line => line.trim().startsWith('-'));
        
        if (subItems.length > 0) {
          const parts = content.split(/\n\s*-\s+/);
          const mainText = parts[0];
          
          let ulHtml = '<ul class="message-ul">';
          for (let i = 1; i < parts.length; i++) {
            const nestedItem = parts[i].replace(/^-\s+/, '');
            ulHtml += `<li class="message-li">${nestedItem}</li>`;
          }
          ulHtml += '</ul>';
          
          listHtml += `<div class="custom-list-item"><span class="item-number">${number}.</span><div class="item-content">${mainText}${ulHtml}</div></div>`;
        } else {
          listHtml += `<div class="custom-list-item"><span class="item-number">${number}.</span><div class="item-content">${mainItem}</div></div>`;
        }
        
        listHtml += '</div>';
        return listHtml;
      });
    }
    
    // Process standalone unordered lists
    const unorderedListPattern = /(?:^|\n)(\s*-\s+[^\n]+)+/g;
    
    processedText = processedText.replace(unorderedListPattern, (match) => {
      if (match.includes('<li class="message-li">')) {
        return match;
      }
      
      const items = match.split(/\n\s*-\s+/).filter(item => item.trim());
      let ulHtml = '<ul class="message-ul">';
      items.forEach(item => {
        ulHtml += `<li class="message-li">${item}</li>`;
      });
      ulHtml += '</ul>';
      return ulHtml;
    });
    
    return processedText;
  }
}

export default ContentFormatter; 