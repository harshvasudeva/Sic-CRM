import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Delete, Divide, Percent } from 'lucide-react'

/**
 * Calculator Modal Component
 * Triggered by Ctrl+N shortcut (like Tally)
 */
function Calculator({ isOpen, onClose }) {
    const [display, setDisplay] = useState('0')
    const [previousValue, setPreviousValue] = useState(null)
    const [operator, setOperator] = useState(null)
    const [waitingForOperand, setWaitingForOperand] = useState(false)
    const [history, setHistory] = useState([])

    const clearAll = useCallback(() => {
        setDisplay('0')
        setPreviousValue(null)
        setOperator(null)
        setWaitingForOperand(false)
    }, [])

    const inputDigit = useCallback((digit) => {
        if (waitingForOperand) {
            setDisplay(digit)
            setWaitingForOperand(false)
        } else {
            setDisplay(display === '0' ? digit : display + digit)
        }
    }, [display, waitingForOperand])

    const inputDecimal = useCallback(() => {
        if (waitingForOperand) {
            setDisplay('0.')
            setWaitingForOperand(false)
        } else if (!display.includes('.')) {
            setDisplay(display + '.')
        }
    }, [display, waitingForOperand])

    const performOperation = useCallback((nextOperator) => {
        const inputValue = parseFloat(display)

        if (previousValue === null) {
            setPreviousValue(inputValue)
        } else if (operator) {
            const currentValue = previousValue || 0
            let result = 0

            switch (operator) {
                case '+':
                    result = currentValue + inputValue
                    break
                case '-':
                    result = currentValue - inputValue
                    break
                case '*':
                    result = currentValue * inputValue
                    break
                case '/':
                    result = inputValue !== 0 ? currentValue / inputValue : 'Error'
                    break
                default:
                    result = inputValue
            }

            if (nextOperator === '=') {
                setHistory(prev => [...prev.slice(-9), `${currentValue} ${operator} ${inputValue} = ${result}`])
            }

            setDisplay(String(result))
            setPreviousValue(result)
        }

        setWaitingForOperand(true)
        setOperator(nextOperator === '=' ? null : nextOperator)
    }, [display, operator, previousValue])

    const toggleSign = useCallback(() => {
        const value = parseFloat(display)
        setDisplay(String(value * -1))
    }, [display])

    const inputPercent = useCallback(() => {
        const value = parseFloat(display)
        setDisplay(String(value / 100))
    }, [display])

    const backspace = useCallback(() => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1))
        } else {
            setDisplay('0')
        }
    }, [display])

    // Keyboard handler
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            e.stopPropagation()

            if (e.key >= '0' && e.key <= '9') {
                inputDigit(e.key)
            } else if (e.key === '.') {
                inputDecimal()
            } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
                performOperation(e.key)
            } else if (e.key === 'Enter' || e.key === '=') {
                performOperation('=')
            } else if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'Backspace') {
                backspace()
            } else if (e.key === 'c' || e.key === 'C') {
                clearAll()
            } else if (e.key === '%') {
                inputPercent()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, inputDigit, inputDecimal, performOperation, onClose, backspace, clearAll, inputPercent])

    const Button = ({ onClick, className = '', children, span = 1 }) => (
        <button
            onClick={onClick}
            className={`calc-btn ${className}`}
            style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}
        >
            {children}
        </button>
    )

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="calculator-modal"
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="calc-header">
                        <h3>Calculator</h3>
                        <button className="btn-icon" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="calc-history">
                            {history.slice(-3).map((item, i) => (
                                <div key={i} className="calc-history-item">{item}</div>
                            ))}
                        </div>
                    )}

                    {/* Display */}
                    <div className="calc-display">
                        <div className="calc-expression">
                            {previousValue !== null && operator && (
                                <span>{previousValue} {operator}</span>
                            )}
                        </div>
                        <div className="calc-value">{display}</div>
                    </div>

                    {/* Buttons */}
                    <div className="calc-buttons">
                        <Button onClick={clearAll} className="calc-btn-function">C</Button>
                        <Button onClick={toggleSign} className="calc-btn-function">±</Button>
                        <Button onClick={inputPercent} className="calc-btn-function">%</Button>
                        <Button onClick={() => performOperation('/')} className="calc-btn-operator">÷</Button>

                        <Button onClick={() => inputDigit('7')}>7</Button>
                        <Button onClick={() => inputDigit('8')}>8</Button>
                        <Button onClick={() => inputDigit('9')}>9</Button>
                        <Button onClick={() => performOperation('*')} className="calc-btn-operator">×</Button>

                        <Button onClick={() => inputDigit('4')}>4</Button>
                        <Button onClick={() => inputDigit('5')}>5</Button>
                        <Button onClick={() => inputDigit('6')}>6</Button>
                        <Button onClick={() => performOperation('-')} className="calc-btn-operator">−</Button>

                        <Button onClick={() => inputDigit('1')}>1</Button>
                        <Button onClick={() => inputDigit('2')}>2</Button>
                        <Button onClick={() => inputDigit('3')}>3</Button>
                        <Button onClick={() => performOperation('+')} className="calc-btn-operator">+</Button>

                        <Button onClick={() => inputDigit('0')} span={2}>0</Button>
                        <Button onClick={inputDecimal}>.</Button>
                        <Button onClick={() => performOperation('=')} className="calc-btn-equals">=</Button>
                    </div>

                    {/* Shortcut hint */}
                    <div className="calc-hint">
                        Press <kbd>Esc</kbd> to close • <kbd>C</kbd> to clear
                    </div>
                </motion.div>
            </motion.div>

            <style>{`
                .calculator-modal {
                    background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    width: 320px;
                    overflow: hidden;
                }

                .calc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .calc-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                }

                .calc-history {
                    padding: 8px 20px;
                    font-size: 11px;
                    color: #6b7280;
                    max-height: 60px;
                    overflow-y: auto;
                }

                .calc-history-item {
                    padding: 2px 0;
                    font-family: 'Fira Code', monospace;
                }

                .calc-display {
                    padding: 20px;
                    text-align: right;
                    background: rgba(0, 0, 0, 0.2);
                }

                .calc-expression {
                    font-size: 14px;
                    color: #6b7280;
                    min-height: 20px;
                    font-family: 'Fira Code', monospace;
                }

                .calc-value {
                    font-size: 40px;
                    font-weight: 300;
                    color: #fff;
                    font-family: 'Fira Code', monospace;
                    word-break: break-all;
                }

                .calc-buttons {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    padding: 16px;
                }

                .calc-btn {
                    height: 56px;
                    border: none;
                    border-radius: 12px;
                    font-size: 20px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }

                .calc-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: scale(1.02);
                }

                .calc-btn:active {
                    transform: scale(0.98);
                }

                .calc-btn-function {
                    background: rgba(99, 102, 241, 0.3);
                    color: #a5b4fc;
                }

                .calc-btn-function:hover {
                    background: rgba(99, 102, 241, 0.4);
                }

                .calc-btn-operator {
                    background: rgba(139, 92, 246, 0.4);
                    color: #c4b5fd;
                }

                .calc-btn-operator:hover {
                    background: rgba(139, 92, 246, 0.5);
                }

                .calc-btn-equals {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                }

                .calc-btn-equals:hover {
                    background: linear-gradient(135deg, #7c7ff2, #9d6df7);
                }

                .calc-hint {
                    text-align: center;
                    padding: 12px;
                    font-size: 11px;
                    color: #6b7280;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .calc-hint kbd {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Fira Code', monospace;
                    font-size: 10px;
                }
            `}</style>
        </AnimatePresence>
    )
}

export default Calculator
