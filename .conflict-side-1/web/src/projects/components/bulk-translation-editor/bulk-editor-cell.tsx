import React from 'react';
import { Box } from '@radix-ui/themes';

interface BulkEditorCellProps {
  value: string;
  isDirty: boolean;
  onChange: (value: string) => void;
}

function BulkEditorCell({ value, isDirty, onChange }: BulkEditorCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isEditing) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleFinishEditing();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setEditValue(value);
        setIsEditing(false);
      }
      if (event.key === 'Tab') {
        handleFinishEditing();
      }
    } else {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleStartEditing();
      }
    }
  };

  if (isEditing) {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          minHeight: '40px',
        }}
      >
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleFinishEditing}
          onKeyDown={handleKeyDown}
          rows={2}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '40px',
            border: '2px solid var(--accent-9)',
            borderRadius: 'var(--radius-1)',
            padding: '4px 8px',
            fontSize: 'var(--font-size-2)',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            backgroundColor: 'var(--color-surface)',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      tabIndex={0}
      role="gridcell"
      onClick={handleStartEditing}
      onKeyDown={handleKeyDown}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '40px',
        padding: '4px 8px',
        cursor: 'text',
        display: 'flex',
        alignItems: 'center',
        fontSize: 'var(--font-size-2)',
        backgroundColor: isDirty ? 'var(--amber-a3)' : undefined,
        borderRadius: 'var(--radius-1)',
      }}
    >
      {value || '\u00A0'}
    </Box>
  );
}

export default BulkEditorCell;
