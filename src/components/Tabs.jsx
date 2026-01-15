import { createContext, useContext, useState } from 'react'

const TabsContext = createContext({})

export function Tabs({ children, defaultValue = '', value, onValueChange }) {
    const [activeTab, setActiveTab] = useState(defaultValue)

    const currentValue = value !== undefined ? value : activeTab

    const handleTabChange = (newValue) => {
        if (onValueChange) {
            onValueChange(newValue)
        } else {
            setActiveTab(newValue)
        }
    }

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleTabChange }}>
            {children}
        </TabsContext.Provider>
    )
}

export function TabsList({ children }) {
    return (
        <div className="tabs-list">
            {children}
        </div>
    )
}

export function TabsTrigger({ children, value }) {
    const { value: activeValue, onValueChange } = useContext(TabsContext)
    const isActive = activeValue === value

    return (
        <button
            className={`tabs-trigger ${isActive ? 'active' : ''}`}
            onClick={() => onValueChange(value)}
        >
            {children}
        </button>
    )
}

export function TabsContent({ children, value }) {
    const { value: activeValue } = useContext(TabsContext)
    
    if (activeValue !== value) {
        return null
    }

    return (
        <div className="tabs-content">
            {children}
        </div>
    )
}
