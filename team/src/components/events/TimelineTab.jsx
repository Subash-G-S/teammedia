import { motion } from "framer-motion"
import { formatDateTime, normalizeStatus } from "./eventUtils"

const MotionDiv = motion.div

function TimelineTab({ event, members, assignments }) {
  const items = [
    {
      id: "created",
      label: "Event Created",
      detail: event.name,
      time: event.createdAt || event.date
    },
    ...assignments.flatMap(assignment => {
      const member = members.find(m => m.id === assignment.memberId)
      const name = member?.name || "Someone"
      const status = normalizeStatus(assignment)
      const base = [{
        id: `${assignment.id}-assigned`,
        label: `${name} Assigned`,
        detail: assignment.role,
        time: assignment.assignedAt
      }]
      if (status === "Covered") base.push({ id: `${assignment.id}-covered`, label: `${name} Covered`, detail: assignment.role, time: assignment.coveredAt || assignment.updatedAt })
      if (status === "Absent") base.push({ id: `${assignment.id}-absent`, label: `${name} Absent`, detail: assignment.role, time: assignment.updatedAt || assignment.coveredAt || assignment.assignedAt })
      if (status === "Cancelled") base.push({ id: `${assignment.id}-cancelled`, label: `${name} Cancelled`, detail: assignment.role, time: assignment.updatedAt || assignment.assignedAt })
      return base
    })
  ].sort((a, b) => {
    const aTime = a.time?.toDate ? a.time.toDate().getTime() : new Date(a.time || 0).getTime()
    const bTime = b.time?.toDate ? b.time.toDate().getTime() : new Date(b.time || 0).getTime()
    return aTime - bTime
  })

  return (
    <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[28px_1fr] gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-cyan-300 shadow-lg shadow-cyan-400/40" />
              {index !== items.length - 1 && <div className="h-full min-h-12 w-px bg-white/15" />}
            </div>
            <div className="pb-6">
              <p className="font-semibold text-white">{item.label}</p>
              <p className="text-sm text-white/50">{item.detail || "Event operation update"}</p>
              <p className="mt-1 text-xs text-white/35">{formatDateTime(item.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </MotionDiv>
  )
}

export default TimelineTab
