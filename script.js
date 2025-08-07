class Calculator {
    constructor() {
        this.currentDisplay = document.getElementById('currentDisplay');
        this.previousDisplay = document.getElementById('previousDisplay');
        this.buttons = document.querySelectorAll('.btn');
        this.reset();
        this.bindEvents();
    }

    bindEvents() {
        // Button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-number]')) {
                this.inputNumber(e.target.dataset.number);
                this.animateButton(e.target);
            }
            
            if (e.target.matches('[data-action]')) {
                this.handleAction(e.target.dataset.action);
                this.animateButton(e.target);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            e.preventDefault(); // Prevent default behavior
            
            // Numbers and decimal
            if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
                this.inputNumber(e.key);
                this.highlightKey(e.key);
            }
            
            // Operations
            if (e.key === '+') {
                this.handleAction('add');
                this.highlightOperator('add');
            }
            if (e.key === '-') {
                this.handleAction('subtract');
                this.highlightOperator('subtract');
            }
            if (e.key === '*') {
                this.handleAction('multiply');
                this.highlightOperator('multiply');
            }
            if (e.key === '/') {
                this.handleAction('divide');
                this.highlightOperator('divide');
            }
            
            // Special functions
            if (e.key === 'Enter' || e.key === '=') {
                this.handleAction('calculate');
                this.highlightButton('.btn-equals');
            }
            if (e.key === 'Escape') {
                this.handleAction('clear');
                this.highlightButton('.btn-clear');
            }
            if (e.key === 'Backspace') {
                this.handleAction('delete');
                this.highlightButton('[data-action="delete"]');
            }
            if (e.key === '%') {
                this.handleAction('percent');
                this.highlightButton('[data-action="percent"]');
            }
        });
    }

    inputNumber(number) {
        // Prevent multiple decimals
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Clear display if needed
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }
        
        // Handle leading zero
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        
        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.chooseOperation(action);
                break;
            case 'calculate':
                this.calculate();
                break;
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'percent':
                this.percent();
                break;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        // Calculate if there's a pending operation
        if (this.previousOperand !== '' && !this.shouldResetDisplay) {
            this.calculate();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.shouldResetDisplay = false;
        
        // Highlight active operator
        this.clearOperatorHighlight();
        this.highlightOperator(operation, true);
        
        this.updateDisplay();
    }

    calculate() {
        let result;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError('Cannot divide by zero!');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        // Handle precision and large numbers
        if (result === Infinity || result === -Infinity) {
            this.showError('Result too large!');
            return;
        }
        
        // Round to avoid floating point errors
        result = Math.round((result + Number.EPSILON) * 1000000000) / 1000000000;
        
        this.currentOperand = result.toString();
        this.operation = null;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
        
        this.clearOperatorHighlight();
        this.updateDisplay();
    }

    clear() {
        this.reset();
        this.clearOperatorHighlight();
        this.updateDisplay();
    }

    delete() {
        if (this.shouldResetDisplay) {
            this.clear();
            return;
        }
        
        if (this.currentOperand.length <= 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        
        this.updateDisplay();
    }

    percent() {
        if (this.currentOperand === '') return;
        
        const current = parseFloat(this.currentOperand);
        this.currentOperand = (current / 100).toString();
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    reset() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetDisplay = false;
    }

    updateDisplay() {
        // Update current display
        const current = this.currentOperand === '' ? '0' : this.currentOperand;
        this.currentDisplay.textContent = this.formatNumber(current);
        this.currentDisplay.classList.remove('error');
        
        // Update previous display
        if (this.operation && this.previousOperand !== '') {
            const operatorSymbol = this.getOperatorSymbol(this.operation);
            let displayText = `${this.formatNumber(this.previousOperand)} ${operatorSymbol}`;
            
            // Show real-time preview
            if (this.currentOperand !== '' && !this.shouldResetDisplay) {
                const preview = this.getPreviewResult();
                if (preview !== null && preview !== 'Error') {
                    displayText += ` ${this.formatNumber(this.currentOperand)} = ${this.formatNumber(preview.toString())}`;
                } else {
                    displayText += ` ${this.formatNumber(this.currentOperand)}`;
                }
            }
            
            this.previousDisplay.textContent = displayText;
        } else {
            this.previousDisplay.textContent = '';
        }
    }

    getPreviewResult() {
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return null;
        
        let result;
        switch (this.operation) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) return 'Error';
                result = prev / current;
                break;
            default:
                return null;
        }
        
        return Math.round((result + Number.EPSILON) * 1000000000) / 1000000000;
    }

    getOperatorSymbol(operation) {
        const symbols = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷'
        };
        return symbols[operation] || '';
    }

    formatNumber(number) {
        const stringNumber = number.toString();
        
        // Handle very large numbers
        if (stringNumber.length > 15) {
            const num = parseFloat(stringNumber);
            return num.toExponential(6);
        }
        
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    showError(message) {
        this.currentDisplay.textContent = 'Error';
        this.currentDisplay.classList.add('error');
        this.previousDisplay.textContent = message;
        
        setTimeout(() => {
            this.clear();
        }, 2000);
    }

    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    highlightKey(key) {
        const button = document.querySelector(`[data-number="${key}"]`);
        if (button) this.animateButton(button);
    }

    highlightOperator(operation, persistent = false) {
        const button = document.querySelector(`[data-action="${operation}"]`);
        if (button) {
            this.animateButton(button);
            if (persistent) {
                button.classList.add('active');
            }
        }
    }

    highlightButton(selector) {
        const button = document.querySelector(selector);
        if (button) this.animateButton(button);
    }

    clearOperatorHighlight() {
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});