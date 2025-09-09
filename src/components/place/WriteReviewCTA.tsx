interface WriteReviewCTAProps {
  onOpenModal: () => void;
}

export default function WriteReviewCTA({ onOpenModal }: WriteReviewCTAProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Experience</h2>
        <p className="text-gray-600 mb-6">
          Help others by sharing your experience at this place.
        </p>
        <button
          onClick={onOpenModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Write a review
        </button>
      </div>
    </div>
  );
}
