interface Props {
  onPick: (text: string) => void;
}

export default function SuggestionChips({ onPick }: Props) {
  const items = [
    'Find an emergency vet near 98101',
    'Top-rated shelters within 10 miles',
    'Which clinic handles exotics?',
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <button
          key={t}
          onClick={() => onPick(t)}
          className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
        >
          {t}
        </button>
      ))}
    </div>
  );
}


