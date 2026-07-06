interface Props {
  liked: boolean;
  count: number;
  onToggle?: () => void;
  readOnly?: boolean;
}

export default function LikeButton({ liked, count, onToggle, readOnly }: Props) {
  if (readOnly) {
    if (count <= 0) return null;
    return (
      <div
        className="flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-red-500"
        aria-label={`收到 ${count} 个赞`}
      >
        <span className="text-lg leading-none">❤️</span>
        <span className="text-xs">{count}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition active:scale-95 ${
        liked ? 'text-red-500' : 'text-slate-300'
      }`}
      aria-label={liked ? '取消点赞' : '点赞'}
    >
      <span className={`text-lg leading-none ${liked ? 'animate-pulse' : ''}`}>{liked ? '❤️' : '🤍'}</span>
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}
