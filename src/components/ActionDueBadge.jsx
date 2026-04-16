import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

export default function ActionDueBadge({ dueDate, isDone }) {
  if (!dueDate) return null;

  const date = parseISO(dueDate);
  const overdue = isPast(date) && !isToday(date);

  let label, cls;

  if (isDone) {
    label = "Done";
    cls = "bg-emerald-100 text-emerald-700 border border-emerald-200";
  } else if (overdue) {
    label = format(date, "d MMM");
    cls = "bg-red-100 text-red-700 border border-red-200 font-bold";
  } else if (isToday(date)) {
    label = "TODAY";
    cls = "bg-amber-100 text-amber-700 border border-amber-200 font-bold tracking-wide";
  } else if (isTomorrow(date)) {
    label = "TOMORROW";
    cls = "bg-orange-100 text-orange-700 border border-orange-200 font-bold tracking-wide";
  } else {
    label = format(date, "d MMM");
    cls = "bg-blue-50 text-blue-600 border border-blue-200";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${cls}`}>
      {label}
    </span>
  );
}