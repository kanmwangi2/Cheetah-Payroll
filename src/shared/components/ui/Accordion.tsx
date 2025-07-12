/**
 * Accordion Component
 * Expandable/collapsible content sections with accessibility support
 */

import React, { useState, ReactNode } from 'react';

interface AccordionItemProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps & { 
  isExpanded: boolean; 
  onToggle: () => void;
}> = ({ id, title, children, isExpanded, onToggle }) => {
  return (
    <div className="accordion">
      <button
        className="accordion-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
      >
        <span>{title}</span>
        <ChevronIcon className={`accordion-icon ${isExpanded ? 'expanded' : ''}`} />
      </button>
      {isExpanded && (
        <div
          className="accordion-content"
          id={`${id}-content`}
          aria-labelledby={`${id}-header`}
          role="region"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion: React.FC<AccordionProps> = ({ 
  items, 
  allowMultiple = false, 
  className = '' 
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(items.filter(item => item.defaultExpanded).map(item => item.id))
  );

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(itemId);
      }
      
      return newSet;
    });
  };

  return (
    <div className={`accordion-container ${className}`}>
      {items.map(item => (
        <AccordionItem
          key={item.id}
          {...item}
          isExpanded={expandedItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  );
};

// Chevron icon component
const ChevronIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

export default Accordion;