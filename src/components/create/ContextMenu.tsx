import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  mapCoords?: { lat: number; lng: number };
  onClose: () => void;
  onCopy: () => void;
  onPaste: (coords?: { lat: number; lng: number }) => void;
  onCut: () => void;
  onDelete: () => void;
  canPaste: boolean;
  selectedShape: DrawnLine | null;
}

export function ContextMenu({ 
  x, 
  y, 
  mapCoords, 
  onClose, 
  onCopy, 
  onPaste, 
  onCut, 
  onDelete, 
  canPaste,
  selectedShape 
}: ContextMenuProps) {
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { 
      label: 'Copy', 
      onClick: onCopy, 
      shortcut: '⌘C',
      disabled: !selectedShape 
    },
    { 
      label: 'Paste', 
      onClick: () => onPaste(mapCoords), 
      shortcut: '⌘V', 
      disabled: !canPaste 
    },
    { 
      label: 'Cut', 
      onClick: onCut, 
      shortcut: '⌘X',
      disabled: !selectedShape 
    },
    { 
      label: 'Delete', 
      onClick: onDelete, 
      shortcut: '⌫',
      disabled: !selectedShape 
    },
  ];

  return (
    <div
      data-context-menu
      className="fixed bg-white shadow-lg rounded-lg py-1 min-w-[200px] z-50 border border-gray-200"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => (
        <button
          key={item.label}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          disabled={item.disabled}
          className={`w-full px-4 py-2 text-left flex justify-between items-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
            index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
          }`}
        >
          <span>{item.label}</span>
          <span className="text-gray-400 text-sm">{item.shortcut}</span>
        </button>
      ))}
    </div>
  );
}