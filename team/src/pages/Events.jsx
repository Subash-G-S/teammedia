import { useState, useEffect } from "react"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Loader from "../components/Loader"

function Events(){

  const [name,setName] = useState("")
  const [type,setType] = useState("small")
  const [parentId,setParentId] = useState("")
  const [date,setDate] = useState("")
  const [venue,setVenue] = useState("")
  const [events,setEvents] = useState([])
  const [loading,setLoading] = useState(true)

  const { id } = useParams()
  const navigate = useNavigate()

  const eventsRef = collection(db,"events")

  const fetchEvents = async () => {
    try{
      setLoading(true)
      const data = await getDocs(eventsRef)
      setEvents(data.docs.map(doc => ({...doc.data(), id: doc.id})))
    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchEvents()
  },[])

  const filteredEvents = id
    ? events.filter(e => e.parentId === id)
    : events.filter(e => !e.parentId)

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

    fetchEvents()
  }

  if (loading) return <Loader />

  return(

    <div>

      <h1 className="text-2xl font-semibold mb-6 text-white">
        Events
      </h1>

      {/* FORM */}

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-lg mb-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          <input
            placeholder="Event Name"
            className="bg-white/10 border border-white/20 p-2 rounded-lg text-white"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            type="date"
            className="bg-white/10 border border-white/20 p-2 rounded-lg text-white"
            value={date}
            onChange={(e)=>setDate(e.target.value)}
          />

          <input
            placeholder="Venue"
            className="bg-white/10 border border-white/20 p-2 rounded-lg text-white"
            value={venue}
            onChange={(e)=>setVenue(e.target.value)}
          />

          <select
            className="bg-white/10 border border-white/20 p-2 rounded-lg text-white"
            value={type}
            onChange={(e)=>setType(e.target.value)}
          >
            <option value="small">Small</option>
            <option value="large">Large</option>
          </select>

          <button
            onClick={addEvent}
            className="bg-blue-500 hover:bg-blue-600 
                       shadow-lg hover:shadow-blue-500/40 
                       text-white rounded-lg transition"
          >
            Add
          </button>

        </div>

      </div>

      {/* BACK BUTTON */}
      {id && (
        <button
          onClick={()=>navigate("/events")}
          className="mb-4 px-4 py-2 bg-white/10 rounded-lg"
        >
          ← Back
        </button>
      )}

      {/* EVENTS GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredEvents.map(event => (

          <motion.div
            key={event.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 
                       p-6 rounded-xl shadow-lg 
                       hover:shadow-blue-500/20 
                       cursor-pointer transition-all duration-300"

            onClick={()=>{
              if(event.type === "large"){
                navigate(`/events/${event.id}`)
              } else {
                navigate(`/assignments/${event.id}`)
              }
            }}
          >

            <h2 className="text-lg font-semibold text-white">
              {event.name}
            </h2>

            <p className="text-sm text-gray-300 mt-2">
              {event.type === "large" ? "Large Event" : "Small Event"}
            </p>

          </motion.div>

        ))}

      </div>

    </div>
  )
}

export default Events