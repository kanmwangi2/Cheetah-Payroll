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
  showExpandCollapseAll?: boolean;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
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
  className = '',
  showExpandCollapseAll = false,
  onExpandAll,
  onCollapseAll
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

  const expandAll = () => {
    setExpandedItems(new Set(items.map(item => item.id)));
    onExpandAll?.();
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
    onCollapseAll?.();
  };

  const allExpanded = expandedItems.size === items.length;
  const allCollapsed = expandedItems.size === 0;

  return (
    <div className={`accordion-container ${className}`}>
      {showExpandCollapseAll && (
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-lg)',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={expandAll}
            disabled={allExpanded}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              background: allExpanded ? 'var(--color-bg-tertiary)' : 'var(--color-button-primary)',
              color: allExpanded ? 'var(--color-text-secondary)' : 'var(--color-text-inverse)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--border-radius-md)',
              cursor: allExpanded ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              transition: 'all var(--transition-fast)',
              opacity: allExpanded ? 0.6 : 1
            }}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            disabled={allCollapsed}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              background: allCollapsed ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
              color: allCollapsed ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--border-radius-md)',
              cursor: allCollapsed ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              transition: 'all var(--transition-fast)',
              opacity: allCollapsed ? 0.6 : 1
            }}
          >
            Collapse All
          </button>
        </div>
      )}
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