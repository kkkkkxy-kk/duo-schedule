/** 正五角星几何：5 个外顶点 + 5 个内凹点（viewBox 0 0 24 24） */
function buildStarGeometry(cx = 12, cy = 12, outerR = 10, innerR = 4.2) {
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const oa = ((-90 + i * 72) * Math.PI) / 180;
    const ia = ((-90 + 36 + i * 72) * Math.PI) / 180;
    outer.push([cx + outerR * Math.cos(oa), cy + outerR * Math.sin(oa)]);
    inner.push([cx + innerR * Math.cos(ia), cy + innerR * Math.sin(ia)]);
  }
  // 整星轮廓：O0-I0-O1-I1-...
  const outline = outer.flatMap((o, i) => [o, inner[i]]);
  // 每个角 = 外顶点 + 两侧内凹点
  const tips = outer.map((o, i) => {
    const prevInner = inner[(i + 4) % 5];
    const nextInner = inner[i];
    return [o, prevInner, nextInner] as [number, number][];
  });
  return { outline, tips };
}

const GEO = buildStarGeometry();

function pointsAttr(pts: [number, number][]) {
  return pts.map((p) => p.join(',')).join(' ');
}

const STAR_SIZE = 25; // 原 36 的约 70%
const MAX_VISIBLE = 5;

/** 1～5 角用不同深浅金色，便于一眼分辨进度 */
const TIP_COLORS = [
  '#fef3c7', // 1 角：很浅金
  '#fde68a', // 2 角
  '#fbbf24', // 3 角
  '#f59e0b', // 4 角
  '#d97706', // 5 角：深金
] as const;

interface StarProps {
  /** 0–5：已点亮的角数 */
  filledTips: number;
  glowing?: boolean;
  size?: number;
}

function Star({ filledTips, glowing, size = STAR_SIZE }: StarProps) {
  const tips = Math.max(0, Math.min(5, filledTips));
  const isFull = tips === 5;

  return (
    <span
      className={`relative inline-block shrink-0 ${glowing && isFull ? 'star-glow' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size} height={size} className="overflow-visible">
        {/* 未满星：白底 + 更细更浅的灰边 */}
        {!isFull && (
          <polygon
            points={pointsAttr(GEO.outline)}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        )}
        {/* 按角上色：已点亮角无描边 */}
        {!isFull &&
          GEO.tips.map((tipPts, i) =>
            i < tips ? (
              <polygon key={i} points={pointsAttr(tipPts)} fill={TIP_COLORS[i]} stroke="none" />
            ) : null,
          )}
        {/* 满星：纯金色填充，无描边 */}
        {isFull && <polygon points={pointsAttr(GEO.outline)} fill="#f59e0b" stroke="none" />}
      </svg>
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
