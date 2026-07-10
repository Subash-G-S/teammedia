import { motion } from "framer-motion"
import { CalendarDays, MapPin, Trash2 } from "lucide-react"
import StatusBadge from "./StatusBadge"
import { formatDate } from "./eventUtils"

const MotionDiv = motion.div

function EventHero({ event, status, onBack, onDelete }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sky-500/30 via-violet-500/25 to-emerald-400/20 p-6 shadow-2xl shadow-blue-950/30 sm:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.20),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_30%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              onClick={onBack}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 transition hover:bg-white/15"
            >
              Back to Events
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-full border border-rose-300/25 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25"
            >
              <Trash2 size={15} />
              Delete Event
            </button>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            <span className="rounded-full border border-white/15 bg-black/15 px-3 py-1 text-xs font-semibold text-white/75">
              {event.type === "large" ? "Large Event" : "Small Event"}
            </span>
          </div>
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {event.name}
          </h1>
        </div>
        <div className="grid gap-3 text-sm text-white/85 sm:grid-cols-2 lg:min-w-80 lg:grid-cols-1">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
            <MapPin size={18} />
            <span>{event.venue || "Venue not added"}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
            <CalendarDays size={18} />
            <span>{formatDate(event.date)}</span>
          </div>
        </div>
      </div>
    </MotionDiv>
  )
}

export default EventHero
