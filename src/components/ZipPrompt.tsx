'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ZipPromptProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (zip: string) => void;
}

export default function ZipPrompt({ open, onClose, onSubmit }: ZipPromptProps) {
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setZip('');
      setError('');
    }
  }, [open]);

  // Validate ZIP code (5 digits only)
  const isValidZip = /^[0-9]{5}$/.test(zip);

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setZip(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = () => {
    if (isValidZip) {
      onSubmit(zip);
    } else {
      setError('Please enter a valid 5-digit ZIP code');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidZip) {
      handleSubmit();
    }
  };

  const handleCancel = () => {
    setZip('');
    setError('');
    onClose();
  };

  // Don't render if modal is closed
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30"
        onClick={handleCancel}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Enter your ZIP
        </h2>
        
        {/* Input Field */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={zip}
            onChange={handleZipChange}
            onKeyPress={handleKeyPress}
            placeholder="12345"
            maxLength={5}
            className={`
              w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          
          {/* Helper Text */}
          <p className="text-xs text-gray-500 mt-1">
            5-digit US ZIP
          </p>
          
          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-500 mt-1">
              {error}
            </p>
          )}
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValidZip}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${isValidZip 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
