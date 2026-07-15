import { useEffect, useMemo, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Sparkles,
  Users
} from "lucide-react"
import { db } from "../services/firebase"
import Loader from "../components/Loader"
import { getEventStatus, normalizeStatus } from "../components/events/eventUtils"

function Dashboard() {
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, "members"), (snap) => {
      setMembers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })

    const unsubEvents = onSnapshot(collection(db, "events"), (snap) => {
      setEvents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })

    const unsubAssignments = onSnapshot(collection(db, "assignments"), (snap) => {
      setAssignments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })

    return () => {
      unsubMembers()
      unsubEvents()
      unsubAssignments()
    }
  }, [])

  const insights = useMemo(() => {
    const roleCount = {}
    members.forEach((member) => {
      roleCount[member.role] = (roleCount[member.role] || 0) + 1
    })

    const topRole = Object.keys(roleCount).reduce(
      (best, current) => (roleCount[best] > roleCount[current] ? best : current),
      "None"
    )

    const pendingAssignments = assignments.filter((assignment) => normalizeStatus(assignment) === "Assigned")
    const coveredAssignments = assignments.filter((assignment) => normalizeStatus(assignment) === "Covered")
    const coverage = assignments.length
      ? Math.round((coveredAssignments.length / assignments.length) * 100)
      : 0

    const eventsWithStatus = events
      .map((event) => ({
        ...event,
        status: getEventStatus(event, assignments.filter((item) => item.eventId === event.id))
      }))
      .filter((event) => event.status === "Upcoming" || event.status === "Ongoing")
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))

    return {
      topRole,
      pendingAssignments,
      coveredAssignments,
      coverage,
      eventsWithStatus
    }
  }, [members, events, assignments])

  const quickActions = [
    {
      title: "Manage events",
      description: "Review upcoming coverage and keep operations moving.",
      icon: CalendarDays,
      path: "/events"
    },
    {
      title: "Team members",
      description: "Check the roster and member availability at a glance.",
      icon: Users,
      path: "/members"
    },
    {
      title: "Assignments",
      description: "Track who is assigned, covered, or still pending.",
      icon: ClipboardList,
      path: "/assignments"
    },
    {
      title: "Letters",
      description: "Generate and review official letters quickly.",
      icon: FileText,
      path: "/letters"
    }
  ]

  const formatDate = (value) => {
    if (!value) return "TBD"
    const date = value?.toDate ? value.toDate() : new Date(value)
    if (Number.isNaN(date.getTime())) return "TBD"
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 shadow-2xl"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
              <Sparkles size={16} />
              Focus for today
            </div>
            <h1 className="text-3xl font-semibold text-white">Welcome back to the media hub</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Keep an eye on deadlines, resolve pending assignments, and stay ahead of upcoming events from one clean dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">
            <p className="text-slate-400">Today</p>
            <p className="mt-1 font-semibold text-white">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Members", value: members.length, hint: "Active roster" },
          { label: "Events", value: events.length, hint: "Tracked events" },
          { label: "Pending", value: insights.pendingAssignments.length, hint: "Needs attention" },
          { label: "Coverage", value: `${insights.coverage}%`, hint: "Assignments covered" }
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-lg backdrop-blur-xl"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            <p className="mt-1 text-sm text-slate-400">{item.hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Upcoming work</h2>
                <p className="text-sm text-slate-400">The next important items to keep moving.</p>
              </div>
              <button onClick={() => navigate("/events")} className="text-sm text-sky-300 transition hover:text-sky-200">
                View all
              </button>
            </div>

            {insights.eventsWithStatus.length > 0 ? (
              <div className="space-y-3">
                {insights.eventsWithStatus.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                    <div>
                      <p className="font-medium text-white">{event.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{event.venue || "Venue not set"} • {formatDate(event.date)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${event.status === "Ongoing" ? "bg-amber-500/15 text-amber-200" : "bg-sky-500/15 text-sky-200"}`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                No upcoming activity right now. Add a new event to get started.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Quick actions</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {quickActions.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.path)}
                    className="flex items-start justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-left transition hover:border-sky-400/40 hover:bg-slate-900"
                  >
                    <div>
                      <div className="mb-2 inline-flex rounded-xl bg-sky-500/15 p-2 text-sky-200">
                        <Icon size={18} />
                      </div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                    </div>
                    <ArrowRight size={16} className="mt-1 text-slate-500" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">At a glance</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-950/40 px-3 py-3 text-sm">
                <span className="text-slate-400">Most common role</span>
                <span className="font-medium text-white">{insights.topRole}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-950/40 px-3 py-3 text-sm">
                <span className="text-slate-400">Coverage rate</span>
                <span className="font-medium text-white">{insights.coverage}%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-950/40 px-3 py-3 text-sm">
                <span className="text-slate-400">Assigned but not covered</span>
                <span className="font-medium text-white">{insights.pendingAssignments.length}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Needs attention</h2>
            {insights.pendingAssignments.length > 0 ? (
              <div className="space-y-2">
                {insights.pendingAssignments.slice(0, 4).map((assignment) => {
                  const member = members.find((item) => item.id === assignment.memberId)
                  return (
                    <div key={assignment.id} className="flex items-center gap-3 rounded-2xl bg-slate-950/40 px-3 py-3 text-sm">
                      <AlertCircle size={16} className="text-amber-300" />
                      <div>
                        <p className="font-medium text-white">{member?.name || "Unassigned member"}</p>
                        <p className="text-slate-400">{assignment.role || "Role pending"}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Everything looks clear right now.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard