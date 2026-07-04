interface Props {
  liked: boolean;
  count: number;
  onToggle: () => void;
}

export default function LikeButton({ liked, count, onToggle }: Props) {
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
