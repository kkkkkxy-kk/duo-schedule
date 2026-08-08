import { useId } from 'react';

/** 正五角星 path（viewBox 0 0 24 24，尖朝上） */
const STAR_PATH =
  'M12 2.2l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.1 6.1 20.4l1.2-6.6L2.4 9.2l6.7-.9L12 2.2z';

interface StarProps {
  /** 0–5：金色填充的角数；5 为满星 */
  filledTips: number;
  glowing?: boolean;
  size?: number;
}

function Star({ filledTips, glowing, size = 18 }: StarProps) {
  const uid = useId().replace(/:/g, '');
  const tips = Math.max(0, Math.min(5, filledTips));
  const pct = (tips / 5) * 100;

  return (
    <span
      className={`relative inline-block shrink-0 ${glowing && tips === 5 ? 'star-glow' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size} height={size} className="absolute inset-0 overflow-visible">
        <path
          d={STAR_PATH}
          fill={tips === 0 ? 'rgba(255,255,255,0.55)' : 'none'}
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {tips > 0 && (
        <span
          className="absolute inset-0"
          style={{
            clipPath: `conic-gradient(from -90deg, #000 ${pct}%, transparent 0)`,
          }}
        >
          <svg viewBox="0 0 24 24" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id={`star-gold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <path
              d={STAR_PATH}
              fill={`url(#star-gold-${uid})`}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </span>
  );
}

interface BadgeRowProps {
  fullStars: number;
  filledTips: number;
  completeDays: number;
}

/** 最多直接展示的满星数量，超出则右侧显示数字 */
const MAX_VISIBLE_FULL = 3;

export default function BadgeRow({ fullStars, filledTips, completeDays }: BadgeRowProps) {
  const showProgressStar = filledTips > 0 || fullStars === 0;
  const overflow = fullStars > MAX_VISIBLE_FULL;
  const visibleFull = overflow ? 2 : fullStars;

  return (
    <div
      className="flex min-w-0 max-w-[10rem] items-center gap-0.5"
      title={`已完整完成 ${completeDays} 天 · 满星 ${fullStars} · 当前 ${filledTips}/5 角`}
      aria-label={`奖章：${fullStars} 颗满星，当前进度 ${filledTips} 角`}
    >
      {Array.from({ length: visibleFull }, (_, i) => (
        <Star key={`full-${i}`} filledTips={5} glowing />
      ))}

      {overflow && (
        <span className="ml-0.5 shrink-0 rounded-full bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700">
          ×{fullStars}
        </span>
      )}

      {showProgressStar && <Star filledTips={filledTips} />}
    </div>
  );
}
