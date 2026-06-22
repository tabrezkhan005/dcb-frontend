import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(relativeTime);
dayjs.extend(calendar);

export function formatDate(date: string | Date): string {
  return dayjs(date).format("D MMM YYYY");
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format("D MMM YYYY, h:mm A");
}

export function formatTimeAgo(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function formatFY(fy: string): string {
  return `FY ${fy}`;
}

export function getCurrentFY(now = new Date()): string {
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const end = y + 1;
  const shortEnd = String(end).slice(2);
  return `${y}-${shortEnd}`;
}

/** FY dropdown options (current Indian FY first, then prior years). */
export function financialYearSelectOptions(yearsBack = 5): { label: string; value: string }[] {
  const now = new Date();
  const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const out: { label: string; value: string }[] = [];
  for (let i = 0; i < yearsBack; i++) {
    const y = start - i;
    const shortEnd = String(y + 1).slice(2);
    const v = `${y}-${shortEnd}`;
    out.push({ label: `FY ${v}`, value: v });
  }
  return out;
}
