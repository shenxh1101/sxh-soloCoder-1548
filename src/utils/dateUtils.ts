import {
  format,
  addDays,
  differenceInDays,
  isToday,
  isTomorrow,
  isPast,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: zhCN });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
}

export function formatDateChinese(date: string | Date): string {
  return formatDate(date, 'M月d日');
}

export function addDaysToDate(date: string | Date, days: number): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(addDays(d, days), 'yyyy-MM-dd');
}

export function getDaysBetween(from: string | Date, to: string | Date): number {
  const fromDate = typeof from === 'string' ? startOfDay(new Date(from)) : startOfDay(from);
  const toDate = typeof to === 'string' ? startOfDay(new Date(to)) : startOfDay(to);
  return differenceInDays(toDate, fromDate);
}

export function getDaysUntil(date: string | Date): number {
  return getDaysBetween(new Date(), date);
}

export function isDateToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isToday(d);
}

export function isDateTomorrow(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isTomorrow(d);
}

export function isDatePast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isPast(endOfDay(d));
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const date = new Date(year, month - 1, 1);
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  return getMonthRange(now.getFullYear(), now.getMonth() + 1);
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getNowString(): string {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
