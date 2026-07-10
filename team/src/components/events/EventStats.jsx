import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Clock3, Users } from "lucide-react"

const statMeta = [
  { key: "total", label: "Total Assigned", icon: Users, className: "from-sky-400/20 to-blue-500/10" },
  { key: "covered", label: "Covered", icon: CheckCircle2, className: "from-emerald-400/20 to-teal-500/10" },
  { key: "pending", label: "Pending", icon: Clock3, className: "from-amber-400/20 to-orange-500/10" },
  { key: "absent", label: "Absent", icon: AlertCircle, className: "from-rose-400/20 to-pink-500/10" }
]

const MotionDiv = motion.div

function EventStats({ metrics }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statMeta.map((item, index) => {
        const Icon = item.icon
        return (
          <MotionDiv
            key={item.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -5 }}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${item.className} p-5 shadow-lg backdrop-blur-xl`}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-white/65">{item.label}</p>
              <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                <Icon size={18} />
              </div>
            </div>
            <p className="text-4xl font-bold text-white">{metrics[item.key]}</p>
          </MotionDiv>
        )
      })}
    </div>
  )
}

export default EventStats
