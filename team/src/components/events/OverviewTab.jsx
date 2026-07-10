import { motion } from "framer-motion"
import { formatDate } from "./eventUtils"

const MotionDiv = motion.div

function OverviewTab({ event, metrics }) {
  const details = [
    ["Venue", event.venue || "Not added"],
    ["Date", formatDate(event.date)],
    ["Type", event.type === "large" ? "Large Event" : "Small Event"],
    ["Status", event.status || "Auto calculated"],
    ["Members Assigned", metrics.total],
    ["Coverage Summary", `${metrics.covered} covered, ${metrics.pending} pending, ${metrics.absent} absent`]
  ]

  return (
    <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <p className="text-sm text-white/60">Coverage</p>
        <div className="mt-4 flex items-end gap-2">
          <span className="text-5xl font-bold">{metrics.coverage}%</span>
          <span className="pb-2 text-sm text-white/55">complete</span>
        </div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
          <MotionDiv
            initial={{ width: 0 }}
            animate={{ width: `${metrics.coverage}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {details.map(([label, value], index) => (
          <MotionDiv
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{value}</p>
          </MotionDiv>
        ))}
      </div>
    </MotionDiv>
  )
}

export default OverviewTab
