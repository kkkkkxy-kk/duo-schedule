/** 可提前编辑的天数（含今天共 8 天：今天 + 接下来 7 天） */
export const ADVANCE_EDIT_DAYS = 7;

export function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 可编辑的最远日期：今天 + 7 天 */
export function maxEditableDate(): string {
  return addDays(todayStr(), ADVANCE_EDIT_DAYS);
}

/** 今天及未来一周内可编辑；历史日仅可查看 */
export function isEditableDate(dateStr: string): boolean {
  const today = todayStr();
  return dateStr >= today && dateStr <= maxEditableDate();
}

export function formatDateLabel(dateStr: string): string {
  const today = todayStr();
  if (dateStr === today) return '今日';
  if (dateStr === addDays(today, 1)) return '明天';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}
