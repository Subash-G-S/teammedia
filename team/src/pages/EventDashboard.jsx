import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch
} from "firebase/firestore"
import Loader from "../components/Loader"
import EventHero from "../components/events/EventHero"
import EventStats from "../components/events/EventStats"
import MediaTeamTab from "../components/events/MediaTeamTab"
import OverviewTab from "../components/events/OverviewTab"
import ReportsTab from "../components/events/ReportsTab"
import TimelineTab from "../components/events/TimelineTab"
import { db } from "../services/firebase"
import { getEventMetrics, getEventStatus, normalizeStatus } from "../components/events/eventUtils"

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "media", label: "Media Team" },
  { id: "timeline", label: "Timeline" },
  { id: "reports", label: "Reports" }
]

const MotionDiv = motion.div
const MotionSpan = motion.span

function EventDashboard() {
  const params = useParams()
  const eventId = params.id || params.eventId
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [subEvents, setSubEvents] = useState([])
  const [members, setMembers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [report, setReport] = useState({ items: {}, notes: "" })
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [eventsSnap, membersSnap, assignmentsSnap, reportSnap] = await Promise.all([
        getDocs(collection(db, "events")),
        getDocs(collection(db, "members")),
        getDocs(collection(db, "assignments")),
        getDoc(doc(db, "eventReports", eventId))
      ])

      const eventList = eventsSnap.docs.map(item => ({ id: item.id, ...item.data() }))
      const currentEvent = eventList.find(item => item.id === eventId)

      setEvent(currentEvent || null)
      setSubEvents(eventList.filter(item => item.parentId === eventId))
      setMembers(membersSnap.docs.map(item => ({ id: item.id, ...item.data() })))
      setAssignments(assignmentsSnap.docs.map(item => ({ id: item.id, ...item.data() })))
      setReport(reportSnap.exists() ? reportSnap.data() : { items: {}, notes: "" })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    queueMicrotask(fetchData)
  }, [fetchData])

  const relevantEventIds = useMemo(() => [eventId, ...subEvents.map(item => item.id)], [eventId, subEvents])
  const currentAssignments = useMemo(
    () => assignments.filter(item => relevantEventIds.includes(item.eventId)),
    [assignments, relevantEventIds]
  )
  const directAssignments = useMemo(
    () => assignments.filter(item => item.eventId === eventId),
    [assignments, eventId]
  )
  const metrics = getEventMetrics(currentAssignments)
  const status = getEventStatus(event || {}, currentAssignments)

  const assignMember = async (memberId, role) => {
    await addDoc(collection(db, "assignments"), {
      memberId,
      eventId,
      role,
      status: "Assigned",
      assignedAt: Date.now(),
      coveredAt: null,
      remarks: ""
    })
    fetchData()
  }

  const updateAssignmentStatus = async (assignment, statusValue) => {
    const payload = {
      status: statusValue,
      coveredAt: statusValue === "Covered" ? Date.now() : null,
      updatedAt: Date.now(),
      remarks: assignment.remarks || ""
    }

    await updateDoc(doc(db, "assignments", assignment.id), payload)
    fetchData()
  }

  const updateReport = async (nextReport) => {
    setReport(nextReport)
    await setDoc(doc(db, "eventReports", eventId), {
      ...nextReport,
      eventId,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }

  const deleteCurrentEvent = async () => {
    const eventIds = [eventId, ...subEvents.map(item => item.id)]
    const assignmentCount = assignments.filter(item => eventIds.includes(item.eventId)).length
    const message = subEvents.length > 0
      ? `Delete "${event.name}" with ${subEvents.length} sub-event(s) and ${assignmentCount} assignment(s)? This cannot be undone.`
      : `Delete "${event.name}" and ${assignmentCount} assignment(s)? This cannot be undone.`

    if (!window.confirm(message)) return

    const batch = writeBatch(db)

    eventIds.forEach(id => {
      batch.delete(doc(db, "events", id))
      batch.delete(doc(db, "eventReports", id))
    })

    assignments
      .filter(item => eventIds.includes(item.eventId))
      .forEach(item => batch.delete(doc(db, "assignments", item.id)))

    await batch.commit()
    navigate("/events")
  }

  if (loading) return <Loader />

  if (!event) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <button onClick={() => navigate("/events")} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold">
          Back to Events
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EventHero event={event} status={status} onBack={() => navigate("/events")} onDelete={deleteCurrentEvent} />
      <EventStats metrics={metrics} />

      {event.type === "large" && subEvents.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
          <p className="mb-3 text-sm font-semibold text-white/65">Sub-events</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {subEvents.map(item => {
              const subAssignments = assignments.filter(assignment => assignment.eventId === item.id)
              const subMetrics = getEventMetrics(subAssignments)
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/events/${item.id}`)}
                  className="min-w-56 rounded-2xl border border-white/10 bg-black/15 p-4 text-left transition hover:bg-white/10"
                >
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs text-white/45">{subMetrics.coverage}% coverage - {subMetrics.pending} pending</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === tab.id ? "text-slate-950" : "text-white/65 hover:text-white"}`}
          >
            {activeTab === tab.id && (
              <MotionSpan layoutId="event-tab" className="absolute inset-0 rounded-xl bg-white" />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <MotionDiv key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          {activeTab === "overview" && <OverviewTab event={event} metrics={metrics} />}
          {activeTab === "media" && (
            <MediaTeamTab
              members={members}
              assignments={directAssignments.map(item => ({ ...item, status: normalizeStatus(item) }))}
              allAssignments={assignments}
              onAssign={assignMember}
              onStatusChange={updateAssignmentStatus}
            />
          )}
          {activeTab === "timeline" && <TimelineTab event={event} members={members} assignments={currentAssignments} />}
          {activeTab === "reports" && <ReportsTab report={report} onReportChange={updateReport} />}
        </MotionDiv>
      </AnimatePresence>
    </div>
  )
}

export default EventDashboard
