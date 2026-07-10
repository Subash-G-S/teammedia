export const STATUS_OPTIONS = ["Assigned", "Covered", "Absent", "Cancelled"]

export const normalizeStatus = (assignment = {}) => {
  if (assignment.status === "Covered" || assignment.status === "completed") return "Covered"
  if (assignment.status === "Absent") return "Absent"
  if (assignment.status === "Cancelled") return "Cancelled"
  if (assignment.covered === true) return "Covered"
  return "Assigned"
}

export const getRollNumber = (member = {}) => (
  member.rollNo || member.rollNumber || member.department || "No roll number"
)

export const formatDate = (value) => {
  if (!value) return "Not scheduled"
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

export const formatDateTime = (value) => {
  if (!value) return "Not recorded"
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return "Not recorded"
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export const getEventStatus = (event = {}, assignments = []) => {
  if (event.status) return event.status
  const eventDate = event.date ? new Date(event.date) : null
  const now = new Date()
  const validDate = eventDate && !Number.isNaN(eventDate.getTime())

  if (validDate && eventDate > now) return "Upcoming"
  if (assignments.length > 0 && assignments.every(a => normalizeStatus(a) !== "Assigned")) return "Completed"
  return "Ongoing"
}

export const getEventMetrics = (assignments = []) => {
  const total = assignments.length
  const covered = assignments.filter(a => normalizeStatus(a) === "Covered").length
  const absent = assignments.filter(a => normalizeStatus(a) === "Absent").length
  const cancelled = assignments.filter(a => normalizeStatus(a) === "Cancelled").length
  const pending = assignments.filter(a => normalizeStatus(a) === "Assigned").length
  const coverage = total ? Math.round((covered / total) * 100) : 0

  return { total, covered, absent, cancelled, pending, coverage }
}

export const roleMatches = (role = "", filter = "") => {
  const normalized = role.toLowerCase()
  if (filter === "Photographers") return normalized.includes("photo")
  if (filter === "Videographers") return normalized.includes("video") && !normalized.includes("editor")
  if (filter === "Video Editors") return normalized.includes("editor")
  if (filter === "Designers") return normalized.includes("design")
  return true
}
