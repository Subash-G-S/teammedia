import { useCallback, useEffect, useMemo, useState } from "react"
import { collection, addDoc, doc, getDocs, writeBatch } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { db } from "../services/firebase"
import EventCard from "../components/events/EventCard"
import Loader from "../components/Loader"
import { getEventMetrics, getEventStatus } from "../components/events/eventUtils"

const filterOptions = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"]
const sortOptions = ["Newest", "Oldest", "Venue", "Coverage %", "Pending"]
const MotionButton = motion.button

function Events() {
  const [name, setName] = useState("")
  const [type, setType] = useState("small")
  const [parentId, setParentId] = useState("")
  const [date, setDate] = useState("")
  const [venue, setVenue] = useState("")
  const [events, setEvents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [sort, setSort] = useState("Newest")

  const navigate = useNavigate()

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const [eventsData, assignmentsData] = await Promise.all([
        getDocs(collection(db, "events")),
        getDocs(collection(db, "assignments"))
      ])
      setEvents(eventsData.docs.map(item => ({ ...item.data(), id: item.id })))
      setAssignments(assignmentsData.docs.map(item => ({ ...item.data(), id: item.id })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(fetchEvents)
  }, [fetchEvents])

  const largeEvents = events.filter(event => event.type === "large")
  const parentEvents = events.filter(event => !event.parentId)

  const visibleEvents = useMemo(() => {
    return parentEvents
      .filter(event => {
        const eventAssignments = assignments.filter(item => item.eventId === event.id)
        const status = getEventStatus(event, eventAssignments)
        return filter === "All" || status === filter
      })
      .sort((a, b) => {
        const aAssignments = assignments.filter(item => item.eventId === a.id)
        const bAssignments = assignments.filter(item => item.eventId === b.id)
        const aMetrics = getEventMetrics(aAssignments)
        const bMetrics = getEventMetrics(bAssignments)

        if (sort === "Oldest") return new Date(a.date || 0) - new Date(b.date || 0)
        if (sort === "Venue") return (a.venue || "").localeCompare(b.venue || "")
        if (sort === "Coverage %") return bMetrics.coverage - aMetrics.coverage
        if (sort === "Pending") return bMetrics.pending - aMetrics.pending
        return new Date(b.date || 0) - new Date(a.date || 0)
      })
  }, [assignments, filter, parentEvents, sort])

  const addEvent = async () => {
    if (!name || !date || !venue) {
      alert("Fill all fields")
      return
    }

    await addDoc(collection(db, "events"), {
      name,
      date,
      venue,
      type,
      parentId: type === "small" ? (parentId || null) : null,
      createdAt: Date.now()
    })

    setName("")
    setDate("")
    setVenue("")
    setType("small")
    setParentId("")
    fetchEvents()
  }

  const deleteEvent = async (event) => {
    const nestedEvents = events.filter(item => item.parentId === event.id)
    const eventIds = [event.id, ...nestedEvents.map(item => item.id)]
    const assignmentCount = assignments.filter(item => eventIds.includes(item.eventId)).length
    const message = nestedEvents.length > 0
      ? `Delete "${event.name}" with ${nestedEvents.length} sub-event(s) and ${assignmentCount} assignment(s)? This cannot be undone.`
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
    fetchEvents()
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Events</h1>
          <p className="mt-2 text-sm text-white/50">Plan coverage, track the media team, and close reports from one operations dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(item => (
            <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm transition ${filter === item ? "bg-white text-slate-950" : "bg-white/10 text-white/70 hover:bg-white/15"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input placeholder="Event Name" className="rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-white/35" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="date" className="rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none" value={date} onChange={(e) => setDate(e.target.value)} />
          <input placeholder="Venue" className="rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-white/35" value={venue} onChange={(e) => setVenue(e.target.value)} />
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-white outline-none">
            <option value="small">Small Event</option>
            <option value="large">Large Event</option>
          </select>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} disabled={type === "large"} className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-white outline-none disabled:opacity-40">
            <option value="">No Parent</option>
            {largeEvents.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
          </select>
          <MotionButton whileTap={{ scale: 0.97 }} onClick={addEvent} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-500">
            Add Event
          </MotionButton>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/45">{visibleEvents.length} event{visibleEvents.length !== 1 && "s"} shown</p>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none">
          {sortOptions.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white/55">
          No events match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              assignments={assignments}
              subEvents={events.filter(item => item.parentId === event.id)}
              onOpen={(id) => navigate(`/events/${id}`)}
              onDelete={deleteEvent}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Events
