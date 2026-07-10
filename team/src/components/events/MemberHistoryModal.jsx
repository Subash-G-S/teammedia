import { motion } from "framer-motion"
import { X } from "lucide-react"
import { getRollNumber, normalizeStatus } from "./eventUtils"

const MotionDiv = motion.div

function MemberHistoryModal({ member, assignments, onClose }) {
  if (!member) return null

  const memberAssignments = assignments.filter(a => a.memberId === member.id)
  const covered = memberAssignments.filter(a => normalizeStatus(a) === "Covered").length
  const absent = memberAssignments.filter(a => normalizeStatus(a) === "Absent").length
  const coverage = memberAssignments.length ? Math.round((covered / memberAssignments.length) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-bold">
              {member.name?.charAt(0)?.toUpperCase() || "M"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{member.name}</h2>
              <p className="text-sm text-white/55">{getRollNumber(member)} - {member.role || "Media"}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2 transition hover:bg-white/20">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["Events Covered", covered],
            ["Events Assigned", memberAssignments.length],
            ["Coverage %", `${coverage}%`],
            ["Absent Count", absent]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs text-white/50">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </MotionDiv>
    </div>
  )
}

export default MemberHistoryModal
