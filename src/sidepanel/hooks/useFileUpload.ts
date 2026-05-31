import { useRef, useCallback } from 'react';

export function useFileUpload(onUpload: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
      }
      onUpload(file);
    },
    [onUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return { inputRef, openFilePicker, handleFileChange, handleDrop, handleDragOver };
}
