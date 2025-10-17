import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

export function calculateProgress(release: string | null, due: string | null): number {
  const now = dayjs().tz("Asia/Bangkok");
  if (!release || !due) return 0;

  const releaseTime = dayjs(release).tz("Asia/Bangkok");
  const dueTime = dayjs(due).tz("Asia/Bangkok");

  const total = dueTime.diff(releaseTime);
  const remaining = dueTime.diff(now);

  if (now.isBefore(releaseTime)) return 100;
  if (now.isAfter(dueTime)) return 0;

  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

export function getProgressColor(release: string | null, due: string | null): string {
  const remaining = calculateProgress(release, due);
  if (remaining > 70) return "green";
  if (remaining > 40) return "orange";
  return "red";
}

export function getRemainingTimeText(due: string | null): string {
  const now = dayjs().tz("Asia/Bangkok");
  if (!due) return "N/A";

  const dueTime = dayjs(due).tz("Asia/Bangkok");
  if (now.isAfter(dueTime)) return "Past Due";

  const duration = dueTime.diff(now, "minute");
  const days = Math.floor(duration / (60 * 24));
  const hours = Math.floor((duration % (60 * 24)) / 60);
  const minutes = duration % 60;

  return (
    [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`]
      .filter(Boolean)
      .join(" ") || "Less than a minute"
  );
}
