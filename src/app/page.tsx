'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ZipPrompt from '@/components/ZipPrompt';

export default function HomePage() {
  const [showZipModal, setShowZipModal] = useState(false);
  const router = useRouter();

  const handleZipSubmit = (zip: string) => {
    router.push(`/search?zip=${zip}`);
  };

  return (
    <>
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl font-bold">🐾 Pet Care Near Me</h1>
          <p className="text-gray-600">
            Find nearby vets & animal shelters quickly and easily.
          </p>
          <button
            onClick={() => setShowZipModal(true)}
            className="inline-block rounded-lg bg-black text-white px-5 py-3 text-sm hover:opacity-90"
          >
            Open Search
          </button>
        </div>
      </main>

      {/* ZipPrompt Modal */}
      <ZipPrompt
        open={showZipModal}
        onClose={() => setShowZipModal(false)}
        onSubmit={handleZipSubmit}
      />
    </>
  );
}
