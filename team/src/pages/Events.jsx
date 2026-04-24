import { useState, useEffect } from "react"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"
import { useParams, useNavigate } from "react-router-dom"
import Loader from "../components/Loader"
function Events(){

  const [name,setName] = useState("")
  const [type,setType] = useState("small")
  const [parentId,setParentId] = useState("")
  const [date,setDate] = useState("")
  const [venue,setVenue] = useState("")
  const [events,setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()

  const eventsRef = collection(db,"events")

  // 🔹 Fetch events
  const fetchEvents = async () => {
  try {
    setLoading(true)

    const data = await getDocs(eventsRef)

    const list = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }))

    setEvents(list)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  useEffect(()=>{
    fetchEvents()
  },[])
  const filteredEvents = id
  ? events.filter(e => e.parentId === id)
  : events.filter(e => !e.parentId)

  // 🔹 Add event
  const addEvent = async () => {

    if(!name || !date || !venue){
      alert("Fill all fields")
      return
    }

    await addDoc(eventsRef,{
      name,
      date,
      venue,
      type,
      parentId: id || (type === "small" ? (parentId || null) : null)
    })

    setName("")
    setDate("")
    setVenue("")
    setType("small")
    setParentId("")

    fetchEvents() // refresh list
  }
  if (loading) return <Loader />
  return(

    <div>

      <h1 className="text-2xl font-semibold mb-6">
        Events
      </h1>

      {/* Form */}

      <div className="bg-white p-6 rounded shadow mb-6">

        <div className="grid grid-cols-5 gap-4">

          <input
            placeholder="Event Name"
            className="border p-2"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            type="date"
            className="border p-2"
            value={date}
            onChange={(e)=>setDate(e.target.value)}
          />

          <input
            placeholder="Venue"
            className="border p-2"
            value={venue}
            onChange={(e)=>setVenue(e.target.value)}
          />

          <button
            onClick={addEvent}
            className="bg-blue-600 text-white rounded"
          >
            Add Event
          </button>

          <select
            className="border p-2"
            value={type}
            onChange={(e)=>setType(e.target.value)}
          >
            <option value="small">Small Event</option>
            <option value="large">Large Event</option>
          </select>
          {type === "small" && (
  <select
    className="border p-2"
    value={parentId}
    onChange={(e)=>setParentId(e.target.value)}
  >
    <option value="">No Parent</option>

    {events
      .filter(e => e.type === "large")
      .map(e => (
        <option key={e.id} value={e.id}>
          {e.name}
        </option>
      ))}
  </select>
)}

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded shadow">

        {/* BACK BUTTON */}
{id && (
  <button
    onClick={()=>navigate("/events")}
    className="mb-4 bg-gray-200 px-4 py-2 rounded"
  >
    ← Back
  </button>
)}

{/* EVENTS GRID */}
<div className="grid grid-cols-3 gap-6">

  {filteredEvents.map(event => (

    <div
      key={event.id}
      className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg"
      onClick={() => {
        if(event.type === "large"){
          navigate(`/events/${event.id}`)
        } else {
  navigate(`/assignments/${event.id}`)
}
      }}
    >

      <h2 className="text-lg font-semibold">
        {event.name}
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        {event.type === "large" ? "Large Event" : "Small Event"}
      </p>

    </div>

  ))}

</div>

      </div>

    </div>

  )

}

export default Events