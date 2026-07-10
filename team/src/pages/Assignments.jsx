import { Navigate, useParams } from "react-router-dom"
import EventDashboard from "./EventDashboard"

function Assignments() {
  const { eventId } = useParams()

  if (!eventId) {
    return <Navigate to="/events" replace />
  }

  return <EventDashboard />
}

export default Assignments
