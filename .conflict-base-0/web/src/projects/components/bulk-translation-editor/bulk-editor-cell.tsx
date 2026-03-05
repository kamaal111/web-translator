import React from 'react';
import { Box } from '@radix-ui/themes';
import clsx from 'clsx';

import styles from './bulk-editor-cell.module.css';

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
      <textarea
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleFinishEditing}
        onKeyDown={handleKeyDown}
        className={clsx(styles.cell, styles.cellEdit)}
      />
    );
  }

  return (
    <Box
      tabIndex={0}
      role="gridcell"
      onClick={handleStartEditing}
      onKeyDown={handleKeyDown}
      className={clsx(styles.cell, styles.cellView, isDirty && styles.cellDirty)}
    >
      {value || '\u00A0'}
    </Box>
  );
}

export default BulkEditorCell;
