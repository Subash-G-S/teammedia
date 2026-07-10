import { normalizeStatus } from "./eventUtils"

const statusClasses = {
  Assigned: "border-amber-300/30 bg-amber-400/15 text-amber-100",
  Covered: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100",
  Absent: "border-rose-300/30 bg-rose-400/15 text-rose-100",
  Cancelled: "border-slate-300/25 bg-slate-400/15 text-slate-100",
  Upcoming: "border-sky-300/30 bg-sky-400/15 text-sky-100",
  Ongoing: "border-violet-300/30 bg-violet-400/15 text-violet-100",
  Completed: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100"
}

function StatusBadge({ status, assignment }) {
  const label = assignment ? normalizeStatus(assignment) : status

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[label] || statusClasses.Assigned}`}>
      {label}
    </span>
  )
}

export default StatusBadge
