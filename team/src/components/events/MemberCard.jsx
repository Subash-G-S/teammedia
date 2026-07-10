import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"
import RoleBadge from "./RoleBadge"
import StatusBadge from "./StatusBadge"
import { formatDateTime, getRollNumber, normalizeStatus } from "./eventUtils"

const MotionDiv = motion.div
const MotionButton = motion.button

function MemberCard({ assignment, member, onStatusChange, onOpenHistory }) {
  const status = normalizeStatus(assignment)

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-lg backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button onClick={() => onOpenHistory(member)} className="flex min-w-0 items-center gap-4 text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white shadow-lg">
            {member?.name?.charAt(0)?.toUpperCase() || "M"}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">{member?.name || "Unknown member"}</h3>
            <p className="text-sm text-white/55">{getRollNumber(member)}</p>
          </div>
        </button>
        <div className="flex flex-wrap gap-2">
          <RoleBadge role={assignment.role || member?.role} />
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
        <div className="rounded-xl bg-black/15 p-3">
          <p className="text-xs text-white/40">Assigned Time</p>
          <p className="mt-1">{formatDateTime(assignment.assignedAt)}</p>
        </div>
        <div className="rounded-xl bg-black/15 p-3">
          <p className="text-xs text-white/40">Covered Time</p>
          <p className="mt-1">{formatDateTime(assignment.coveredAt)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <MotionButton whileTap={{ scale: 0.96 }} onClick={() => onStatusChange(assignment, "Covered")} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
          Mark Covered
        </MotionButton>
        <MotionButton whileTap={{ scale: 0.96 }} onClick={() => onStatusChange(assignment, "Absent")} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400">
          Mark Absent
        </MotionButton>
        <MotionButton whileTap={{ scale: 0.96 }} onClick={() => onStatusChange(assignment, "Assigned")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15">
          <RotateCcw size={15} />
          Undo
        </MotionButton>
      </div>
    </MotionDiv>
  )
}

export default MemberCard
