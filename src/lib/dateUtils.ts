import { format, formatDistance, parseISO, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 日付を日本語形式で表示 (YYYY年MM月DD日)
 */
export function formatDateJa(date: Date | string | null): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '-';
  
  return format(dateObj, 'yyyy年MM月dd日', { locale: ja });
}

/**
 * 日付を短縮形式で表示 (YYYY/MM/DD)
 */
export function formatDateShort(date: Date | string | null): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '-';
  
  return format(dateObj, 'yyyy/MM/dd');
}

/**
 * 日付と時刻を表示 (YYYY/MM/DD HH:mm)
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '-';
  
  return format(dateObj, 'yyyy/MM/dd HH:mm');
}

/**
 * 相対時間を表示 (例: 3日前、2時間前)
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '-';
  
  return formatDistance(dateObj, new Date(), { 
    addSuffix: true,
    locale: ja 
  });
}

/**
 * 時刻のみを表示 (HH:mm)
 */
export function formatTime(date: Date | string | null): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '-';
  
  return format(dateObj, 'HH:mm');
}

/**
 * 年月を表示 (YYYY年MM月)
 */
export function formatYearMonth(date: Date | string | null): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '-';
  
  return format(dateObj, 'yyyy年MM月', { locale: ja });
}

/**
 * カスタムフォーマットで日付を表示
 */
export function formatCustom(date: Date | string | null, formatString: string): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '-';
  
  return format(dateObj, formatString, { locale: ja });
}