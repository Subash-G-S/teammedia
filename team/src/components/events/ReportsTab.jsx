import { motion } from "framer-motion"

const reportItems = [
  "Photos Uploaded",
  "Videos Uploaded",
  "Poster Designed",
  "Instagram Posted",
  "Drive Folder Added"
]

const MotionDiv = motion.div

function ReportsTab({ report, onReportChange }) {
  const completed = reportItems.filter(item => report?.items?.[item]).length
  const percentage = Math.round((completed / reportItems.length) * 100)

  return (
    <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <p className="text-sm text-white/60">Completion Percentage</p>
        <p className="mt-3 text-5xl font-bold">{percentage}%</p>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
          <MotionDiv initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full rounded-full bg-gradient-to-r from-fuchsia-300 to-cyan-300" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <div className="space-y-3">
          {reportItems.map(item => (
            <label key={item} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/15 p-4 transition hover:bg-white/10">
              <span className="font-medium">{item}</span>
              <input
                type="checkbox"
                checked={Boolean(report?.items?.[item])}
                onChange={(e) => onReportChange({ ...report, items: { ...(report?.items || {}), [item]: e.target.checked } })}
                className="h-5 w-5 accent-cyan-300"
              />
            </label>
          ))}
        </div>
        <textarea
          value={report?.notes || ""}
          onChange={(e) => onReportChange({ ...report, notes: e.target.value })}
          placeholder="Notes"
          className="mt-5 min-h-32 w-full rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white outline-none placeholder:text-white/35"
        />
      </div>
    </MotionDiv>
  )
}

export default ReportsTab
