"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

type Doctor = { id: string; name: string; count: number; tags: string[] };
type CommunityState = {
  votes: { yes: number; no: number; myVote: 'yes' | 'no' | null };
  doctors: Doctor[];
};

type Props = {
  scope?: 'place' | 'shelter';
  entityId: string;
};

const STORAGE_PREFIX = 'community:v1';
const keyOf = (scope: string, id: string) => `${STORAGE_PREFIX}:${scope}:${id}`;

const defaultState: CommunityState = {
  votes: { yes: 0, no: 0, myVote: null },
  doctors: [],
};

const SUGGESTED_DOCTOR_TAGS = [
  'Compassionate',
  'Great communicator',
  'Cat specialist',
  'Dog specialist',
  'Emergency expert',
];

const confidenceFrom = (totalVotes: number, doctorsLen: number) => {
  if (totalVotes >= 20 || doctorsLen >= 3) return 'High';
  if (totalVotes >= 5 || doctorsLen >= 1) return 'Medium';
  return 'Low';
};

export default function CommunityInfo({ scope = 'place', entityId }: Props) {
  const storageKey = keyOf(scope, entityId);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [state, setState] = useState<CommunityState>(defaultState);
  const [modalOpen, setModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  const resetModalState = () => {
    setNameInput('');
    setTagInput('');
    setTags([]);
    setShowCustomTagInput(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetModalState();
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  // Load from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      setState(defaultState);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw) }));
    } catch {}
  }, [storageKey, isAuthenticated]);

  // Persist to localStorage
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state, storageKey, isAuthenticated]);

  // Focus trap basics
  useEffect(() => {
    if (modalOpen) setTimeout(() => firstFieldRef.current?.focus(), 0);
  }, [modalOpen]);

  const total = state.votes.yes + state.votes.no;
  const hasVotes = total > 0;
  const pctYes = hasVotes ? Math.round((state.votes.yes / Math.max(1, total)) * 100) : 0;
  const pctNo = hasVotes ? Math.max(0, 100 - pctYes) : 0;
  const confidence = confidenceFrom(total, state.doctors.length);
  const neutralBadge = !hasVotes && state.doctors.length === 0;

  const badgeClass = neutralBadge
    ? 'bg-gray-200 text-gray-700'
    : confidence === 'High'
    ? 'bg-green-100 text-green-800'
    : confidence === 'Medium'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-red-100 text-red-700';

  const announce = (msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = msg;
      // clear later so repeat announcements fire
      setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = '';
      }, 1500);
    }
  };

  // Voting actions (optimistic, local-only)
  const vote = (value: 'yes' | 'no') => {
    if (!isAuthenticated || state.votes.myVote) return;
    setState((prev) => ({
      ...prev,
      votes: {
        yes: prev.votes.yes + (value === 'yes' ? 1 : 0),
        no: prev.votes.no + (value === 'no' ? 1 : 0),
        myVote: value,
      },
    }));
    const nTotal = total + 1;
    const nYes = state.votes.yes + (value === 'yes' ? 1 : 0);
    const yesPctNew = nTotal ? Math.round((nYes / nTotal) * 100) : 0;
    const msg = `Vote recorded. Yes ${yesPctNew}%, No ${100 - yesPctNew}%`;
    announce(msg);
  };

  // Tag chips creation (Enter or ,)
  const tryAddTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    const parts = raw.split(',').map((t) => t.trim()).filter(Boolean);
    setTags((prev) => {
      const existing = new Set(prev.map((t) => t.toLowerCase()));
      const next = [...prev];
      for (const p of parts) {
        const val = p.slice(0, 20);
        if (!existing.has(val.toLowerCase())) {
          existing.add(val.toLowerCase());
          next.push(val);
        }
      }
      return next;
    });
    setTagInput('');
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const toggleSuggestedTag = (label: string) => {
    setTags((prev) => {
      const lower = label.toLowerCase();
      const exists = prev.some((t) => t.toLowerCase() === lower);
      if (exists) return prev.filter((t) => t.toLowerCase() !== lower);
      return [...prev, label];
    });
  };

  const submitDoctor = () => {
    if (!isAuthenticated) return;
    const name = nameInput.trim();
    if (!name) return;
    setState((prev) => {
      const existingIdx = prev.doctors.findIndex((d) => d.name.toLowerCase() === name.toLowerCase());
      let doctors: Doctor[] = [];
      if (existingIdx >= 0) {
        const d = prev.doctors[existingIdx];
        const merged = Array.from(new Set([...(d.tags || []), ...tags]));
        const updated = { ...d, count: d.count + 1, tags: merged };
        doctors = [...prev.doctors];
        doctors[existingIdx] = updated;
      } else {
        const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        doctors = [...prev.doctors, { id, name, count: 1, tags }];
      }
      doctors.sort((a, b) => b.count - a.count);
      return { ...prev, doctors };
    });
    closeModal();
  };

  const visibleDoctors = useMemo(
    () => (showAll ? state.doctors : state.doctors.slice(0, 3)),
    [showAll, state.doctors],
  );

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Info</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">First visit free?</h3>
            <p className="text-sm text-gray-600">Sign in to view community votes.</p>
          </section>
          <section className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Top Doctors (community)</h3>
            <p className="text-sm text-gray-600">Sign in to see recommended doctors.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 relative">
      {/* live region for announcements */}
      <div ref={liveRef} aria-live="polite" className="sr-only" />

      {/* Confidence badge */}
      <span
        className={`absolute right-4 top-4 px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
        title="Confidence is based on the number of votes and recommendations."
      >
        Confidence: {confidence}
      </span>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Info</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Voting Card */}
        <section className="rounded-lg border border-gray-200 p-4 shadow-sm" aria-label="Community vote results">
          <h3 className="font-medium text-gray-900 mb-3">First visit free?</h3>

          {/* Stacked bar */}
          <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden mb-2">
            {hasVotes ? (
              <>
                <div
                  className="h-full bg-green-500 inline-block align-top transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${Math.max(0, Math.min(100, pctYes))}%` }}
                  role="progressbar"
                  aria-valuenow={pctYes}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Yes votes percentage"
                />
                <div
                  className="h-full bg-red-500 inline-block align-top transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${Math.max(0, Math.min(100, pctNo))}%` }}
                  role="progressbar"
                  aria-valuenow={pctNo}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="No votes percentage"
                />
              </>
            ) : (
              <div className="h-full w-full bg-gray-300" aria-label="No votes yet" />
            )}
          </div>
          {/* Percent labels inside segments */}
          <div className="relative w-full h-0">
            <div className="absolute left-2 -top-6 text-xs font-medium text-white drop-shadow-sm select-none">
              {hasVotes ? `${pctYes}%` : '0%'}
            </div>
            <div className="absolute right-2 -top-6 text-xs font-medium text-white drop-shadow-sm select-none">
              {hasVotes ? `${pctNo}%` : '0%'}
            </div>
          </div>

          {/* Helper row below bar: left = thanks, right = based on votes */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
            <span>
              {state.votes.myVote
                ? 'Thanks for voting'
                : hasVotes
                ? ''
                : 'No votes recorded yet'}
            </span>
            <span>{hasVotes ? `Based on ${total} vote${total === 1 ? '' : 's'}` : 'Be the first to vote'}</span>
          </div>

          <div className="mx-auto flex w-full max-w-xs items-center gap-3">
            <button
              aria-label="Vote Yes – First visit free"
              disabled={!isAuthenticated || !!state.votes.myVote}
              onClick={() => vote('yes')}
              className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Yes
            </button>
            <button
              aria-label="Vote No – First visit free"
              disabled={!isAuthenticated || !!state.votes.myVote}
              onClick={() => vote('no')}
              className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              No
            </button>
            <span className="sr-only">Yes {pctYes} percent, No {pctNo} percent</span>
          </div>
        </section>

        {/* Doctor Recommendations Card */}
        <section className="rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Top Doctors (community)</h3>
            <button
              ref={triggerRef}
              aria-label="Recommend a Doctor"
              type="button"
              onClick={() => {
                resetModalState();
                setModalOpen(true);
              }}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
            >
              + Recommend a Doctor
            </button>
          </div>
          {state.doctors.length === 0 ? (
            <p className="text-sm text-gray-600" aria-live="polite">No doctors recommended yet. Be the first to share your experience!</p>
          ) : (
            <>
              <ul className="space-y-3">
                {visibleDoctors.map((d) => (
                  <li key={d.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{d.name}</div>
                        {d.tags?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {d.tags.map((t) => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600" aria-label={`${d.count} recommendations`}>{d.count}</span>
                  </li>
                ))}
              </ul>
              {state.doctors.length > 3 && (
                <button
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  aria-label={showAll ? 'Show fewer doctors' : 'Show all doctors'}
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? 'Show fewer' : 'Show all'}
                </button>
              )}
            </>
          )}
        </section>
      </div>

      {/* Recommend doctor modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" role="dialog" aria-modal="true" aria-labelledby="rec-title">
            <h3 id="rec-title" className="text-lg font-semibold mb-3">Recommend a Doctor</h3>
            <div className="space-y-3">
              <label htmlFor="doc-name" className="block text-sm text-gray-700">Doctor name</label>
              <input id="doc-name" ref={firstFieldRef} aria-label="Doctor name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Dr. Jane Doe" className="w-full rounded-lg border px-3 py-2 text-sm" />

              <div>
                <span className="block text-sm text-gray-700 mb-2">Tags</span>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SUGGESTED_DOCTOR_TAGS.map((tag) => {
                    const active = tags.some((t) => t.toLowerCase() === tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleSuggestedTag(tag)}
                        className={`px-2 py-1 rounded-full text-xs border ${
                          active ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setShowCustomTagInput((v) => !v)}
                    className={`px-2 py-1 rounded-full text-xs border ${
                      showCustomTagInput ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    + Add new
                  </button>
                </div>
                {showCustomTagInput && (
                  <input
                    id="tag-input"
                    aria-label="Add custom tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        tryAddTag();
                      }
                    }}
                    placeholder="Type a tag and press Enter"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                )}
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed="true"
                      aria-label={`Remove tag ${t}`}
                      onClick={() => removeTag(t)}
                      className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border hover:bg-gray-200"
                    >
                      {t} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button disabled={!nameInput.trim()} onClick={submitDoctor} className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
