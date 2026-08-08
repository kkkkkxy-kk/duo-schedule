import { useId } from 'react';

/** 正五角星 path（viewBox 0 0 24 24，尖朝上） */
const STAR_PATH =
  'M12 2.2l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.1 6.1 20.4l1.2-6.6L2.4 9.2l6.7-.9L12 2.2z';

const STAR_SIZE = 36;
/** 最多直接展示的五角星数量（含左侧未点亮/进行中） */
const MAX_VISIBLE = 5;

interface StarProps {
  /** 0–5：金色填充的角数；5 为满星 */
  filledTips: number;
  glowing?: boolean;
  size?: number;
}

function Star({ filledTips, glowing, size = STAR_SIZE }: StarProps) {
  const uid = useId().replace(/:/g, '');
  const tips = Math.max(0, Math.min(5, filledTips));
  const pct = (tips / 5) * 100;
  const isEmpty = tips === 0;

  return (
    <span
      className={`relative inline-block shrink-0 ${glowing && tips === 5 ? 'star-glow' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* 未点亮：白底 + 深灰描边，与金色满星区分开 */}
      <svg viewBox="0 0 24 24" width={size} height={size} className="absolute inset-0 overflow-visible">
        <path
          d={STAR_PATH}
          fill={isEmpty ? '#ffffff' : 'none'}
          stroke={isEmpty ? '#64748b' : '#cbd5e1'}
          strokeWidth={isEmpty ? '1.8' : '1.4'}
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

export default function BadgeRow({ fullStars, filledTips, completeDays }: BadgeRowProps) {
  // 未点亮 / 进行中的星固定在最左侧
  const showProgressStar = filledTips > 0 || fullStars === 0;
  const fullSlots = showProgressStar ? MAX_VISIBLE - 1 : MAX_VISIBLE;
  const visibleFull = Math.min(fullStars, fullSlots);
  const overflow = fullStars > fullSlots;

  return (
    <div
      className="flex min-w-0 items-center gap-1"
      title={`已完整完成 ${completeDays} 天 · 满星 ${fullStars} · 当前 ${filledTips}/5 角`}
      aria-label={`奖章：${fullStars} 颗满星，当前进度 ${filledTips} 角`}
    >
      {showProgressStar && <Star filledTips={filledTips} />}

      {Array.from({ length: visibleFull }, (_, i) => (
        <Star key={`full-${i}`} filledTips={5} glowing />
      ))}

      {overflow && (
        <span className="shrink-0 rounded-full bg-amber-100/90 px-1.5 py-0.5 text-xs font-semibold leading-none text-amber-700">
          ×{fullStars}
        </span>
      )}
    </div>
  );
}
