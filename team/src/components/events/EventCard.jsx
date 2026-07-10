import { motion } from "framer-motion"
import { CalendarDays, MapPin, Trash2, Users } from "lucide-react"
import StatusBadge from "./StatusBadge"
import { formatDate, getEventMetrics, getEventStatus } from "./eventUtils"

const MotionDiv = motion.div

function EventCard({ event, assignments, subEvents = [], onOpen, onDelete }) {
  const eventAssignments = assignments.filter(item => item.eventId === event.id)
  const metrics = getEventMetrics(eventAssignments)
  const status = getEventStatus(event, eventAssignments)

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-xl"
    >
      <button onClick={() => onOpen(event.id)} className="w-full p-5 text-left">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{event.name}</h2>
            <p className="mt-1 text-sm text-white/50">{event.type === "large" ? "Large Event" : "Small Event"}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-2 text-sm text-white/65">
          <p className="flex items-center gap-2"><MapPin size={16} />{event.venue || "Venue not added"}</p>
          <p className="flex items-center gap-2"><CalendarDays size={16} />{formatDate(event.date)}</p>
          <p className="flex items-center gap-2"><Users size={16} />{metrics.total} assigned</p>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-white/50">
            <span>Coverage</span>
            <span>{metrics.coverage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <MotionDiv
              initial={{ width: 0 }}
              animate={{ width: `${metrics.coverage}%` }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            ["Covered", metrics.covered],
            ["Pending", metrics.pending],
            ["Absent", metrics.absent]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-black/15 p-3">
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-white/45">{label}</p>
            </div>
          ))}
        </div>
      </button>

      {subEvents.length > 0 && (
        <div className="border-t border-white/10 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Sub-events</p>
          <div className="space-y-2">
            {subEvents.map(subEvent => {
              const subAssignments = assignments.filter(item => item.eventId === subEvent.id)
              const subMetrics = getEventMetrics(subAssignments)
              return (
                <button
                  key={subEvent.id}
                  onClick={() => onOpen(subEvent.id)}
                  className="flex w-full items-center justify-between rounded-2xl bg-black/15 p-3 text-left transition hover:bg-white/10"
                >
                  <span className="font-medium">{subEvent.name}</span>
                  <span className="text-xs text-white/45">{subMetrics.coverage}% - {subMetrics.pending} pending</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="border-t border-white/10 p-4">
        <button
          onClick={() => onDelete(event)}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
        >
          <Trash2 size={16} />
          Delete Event
        </button>
      </div>
    </MotionDiv>
  )
}

export default EventCard
