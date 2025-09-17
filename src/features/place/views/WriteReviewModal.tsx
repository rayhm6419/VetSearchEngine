"use client";

import { useState, useEffect, useRef } from 'react';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string, firstVisitFree?: 'yes' | 'no' | null) => void;
}

export default function WriteReviewModal({ isOpen, onClose, onSubmit }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [firstVisit, setFirstVisit] = useState<'yes' | 'no' | ''>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && text.trim()) {
      onSubmit(rating, text.trim(), firstVisit === '' ? null : firstVisit);
      setRating(0);
      setText('');
      setFirstVisit('');
      onClose();
    }
  };

  const renderStars = (currentRating: number, isInteractive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        className={`text-2xl transition-colors duration-200 ${
          isInteractive ? 'cursor-pointer' : 'cursor-default'
        } ${
          i < currentRating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        onClick={isInteractive ? () => setRating(i + 1) : undefined}
        onMouseEnter={isInteractive ? () => setHoveredRating(i + 1) : undefined}
        onMouseLeave={isInteractive ? () => setHoveredRating(0) : undefined}
        disabled={!isInteractive}
      >
        ★
      </button>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" />
      
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-xl font-semibold text-gray-900 mb-4">
          Share your experience
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {renderStars(hoveredRating || rating, true)}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating} star{rating !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Was your first visit free? (optional)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFirstVisit('yes')}
                className={`px-3 py-2 rounded-lg text-sm border ${firstVisit === 'yes' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setFirstVisit('no')}
                className={`px-3 py-2 rounded-lg text-sm border ${firstVisit === 'no' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                No
              </button>
              {firstVisit !== '' && (
                <button type="button" onClick={() => setFirstVisit('')} className="text-sm text-gray-600 underline">
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
              Your review
            </label>
            <textarea
              id="review-text"
              ref={firstFocusableRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell others about your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || !text.trim()}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                rating > 0 && text.trim()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
