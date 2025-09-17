"use client";

import { useMemo, useState } from 'react';
import { InfoCardData } from '@/lib/types';

type DoctorItem = { name: string; recCount: number; tags?: string[] };

type Props = {
  mode?: 'place' | 'shelter';
  entityId: string; // placeId or externalId
  data: InfoCardData;
};

export default function InfoCard({ mode = 'place', entityId, data }: Props) {
  const [yes, setYes] = useState<number>(data.firstVisitFree.yes);
  const [no, setNo] = useState<number>(data.firstVisitFree.no);
  const [hasVoted, setHasVoted] = useState(false);
  const [topDoctors, setTopDoctors] = useState<DoctorItem[]>(data.topDoctors as any);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const confidence = data.firstVisitFree.confidence;

  const totalVotes = yes + no;
  const yesPct = totalVotes ? Math.round((yes / totalVotes) * 100) : 0;
  const noPct = 100 - yesPct;

  const badgeColor = confidence === 'high' ? 'bg-green-100 text-green-800' : confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700';

  const vote = async (value: boolean) => {
    const prev = { yes, no };
    value ? setYes((v) => v + 1) : setNo((v) => v + 1);
    setHasVoted(true);
    setSubmitting(true);
    try {
      const url = mode === 'shelter'
        ? `/api/shelters/${entityId}/attributes`
        : `/api/places/${entityId}/attributes/first-visit-free`;
      const body = mode === 'shelter' ? { key: 'first_visit_free', value } : { value };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) throw new Error(j?.error?.message || `${res.status}`);
      if (mode === 'shelter') {
        setYes(j.data.infoCard?.firstVisitFree?.yes ?? prev.yes);
        setNo(j.data.infoCard?.firstVisitFree?.no ?? prev.no);
      } else {
        setYes(j.data.yes ?? prev.yes);
        setNo(j.data.no ?? prev.no);
      }
      setToast('Thanks for voting!');
    } catch (e: any) {
      // revert
      setYes(prev.yes);
      setNo(prev.no);
      setHasVoted(false);
      setToast(e?.message?.includes('401') ? 'Please sign in to vote.' : 'Could not submit vote');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  const tagOptions = useMemo(() => ['General', 'Surgery', 'Dentistry', 'Emergency', 'Exotics', 'Dermatology'], []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const submitDoctor = async () => {
    const name = docName.trim();
    if (!name) return;

    // Optimistic update to list (mock tags kept locally)
    setTopDoctors((prev) => {
      const idx = prev.findIndex((d) => d.name.toLowerCase() === name.toLowerCase());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], recCount: next[idx].recCount + 1, tags: Array.from(new Set([...(next[idx].tags || []), ...selectedTags])) };
        return next.sort((a, b) => b.recCount - a.recCount).slice(0, 3);
      }
      return [...prev, { name, recCount: 1, tags: selectedTags }].sort((a, b) => b.recCount - a.recCount).slice(0, 3);
    });

    setSubmitting(true);
    try {
      const url = mode === 'shelter'
        ? `/api/shelters/${entityId}/doctors/recommend`
        : `/api/places/${entityId}/doctors/recommend`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) throw new Error(j?.error?.message || `${res.status}`);
      // Merge server counts back, keep local tags
      const server = (j.data.topDoctors || []) as Array<{ name: string; recCount: number }>;
      setTopDoctors((prev) => {
        const map = new Map<string, DoctorItem>();
        prev.forEach((d) => map.set(d.name, d));
        server.forEach((d) => {
          const cur = map.get(d.name);
          map.set(d.name, { name: d.name, recCount: d.recCount, tags: cur?.tags || [] });
        });
        return Array.from(map.values()).sort((a, b) => b.recCount - a.recCount).slice(0, 3);
      });
      setToast('Recommendation added');
      setModalOpen(false);
      setDocName('');
      setSelectedTags([]);
    } catch (e: any) {
      setToast(e?.message?.includes('401') ? 'Please sign in to recommend.' : 'Could not add recommendation');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 relative">
      {/* Confidence badge */}
      <span
        className={`absolute right-4 top-4 px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
        title="Confidence is based on the number of community votes and recommendations."
      >
        Confidence: {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
      </span>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Info</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Voting Card */}
        <section className="rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">First visit free?</h3>
          {/* Bar chart */}
          <div className="mb-2" aria-hidden>
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={yesPct} aria-valuemin={0} aria-valuemax={100} aria-label="Yes votes percentage">
              <div className="h-full bg-green-500" style={{ width: `${yesPct}%` }} />
            </div>
            <div className="h-2" />
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={noPct} aria-valuemin={0} aria-valuemax={100} aria-label="No votes percentage">
              <div className="h-full bg-red-500" style={{ width: `${noPct}%` }} />
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Yes {yesPct}% ({yes}), No {noPct}% ({no}) — Based on {totalVotes} vote{totalVotes === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-3">
            <button aria-label="Vote Yes – First visit free" disabled={submitting || hasVoted} onClick={() => vote(true)} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60">Yes</button>
            <button aria-label="Vote No – First visit free" disabled={submitting || hasVoted} onClick={() => vote(false)} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60">No</button>
            {hasVoted && <span className="text-sm text-gray-600">Thanks for voting</span>}
          </div>
        </section>

        {/* Doctor Recommendations Card */}
        <section className="rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Top Doctors (community)</h3>
            <button
              aria-label="Recommend a Doctor"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
            >
              + Recommend a Doctor
            </button>
          </div>
          {topDoctors.length === 0 ? (
            <p className="text-sm text-gray-600" aria-live="polite">No doctors recommended yet. Be the first to share your experience!</p>
          ) : (
            <ul className="space-y-3">
              {topDoctors.slice(0, 3).map((d) => (
                <li key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                      {d.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{d.name}</div>
                      {d.tags && d.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {d.tags.map((t) => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600" aria-label={`${d.recCount} recommendations`}>{d.recCount} rec{d.recCount === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recommend doctor modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-3">Recommend a Doctor</h3>
            <div className="space-y-3">
              <label className="block text-sm text-gray-700">Doctor name</label>
              <input aria-label="Doctor name" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Dr. Jane Doe" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <div>
                <div className="text-sm text-gray-700 mb-1">Specialty tags (optional)</div>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((t) => (
                    <button key={t} type="button" aria-label={`Toggle tag ${t}`} onClick={() => toggleTag(t)} className={`px-2 py-1 rounded-full text-xs border ${selectedTags.includes(t) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button aria-label="Cancel recommend doctor" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button aria-label="Submit doctor recommendation" disabled={!docName.trim() || submitting} onClick={submitDoctor} className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-md shadow" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
