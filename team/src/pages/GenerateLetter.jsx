import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"

function GenerateLetter(){

  const [events,setEvents] = useState([])
  const [assignments,setAssignments] = useState([])
  const [members,setMembers] = useState([])
  const [selectedEvent,setSelectedEvent] = useState("")

  useEffect(()=>{

    const fetchData = async () => {

      const e = await getDocs(collection(db,"events"))
      const a = await getDocs(collection(db,"assignments"))
      const m = await getDocs(collection(db,"members"))

      setEvents(e.docs.map(doc=>({...doc.data(), id:doc.id})))
      setAssignments(a.docs.map(doc=>({...doc.data(), id:doc.id})))
      setMembers(m.docs.map(doc=>({...doc.data(), id:doc.id})))
    }

    fetchData()

  },[])

  const generate = async () => {

    const selectedEventData = events.find(e=>e.id===selectedEvent)

    const assignedMembers = assignments
      .filter(a=>a.eventId===selectedEvent)
      .map(a=>{
        const member = members.find(m=>m.id===a.memberId)
        return member ? member.name + " - " + a.role : ""
      })

    const res = await fetch("http://localhost:5000/generate",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        eventName: selectedEventData.name,
        date: selectedEventData.date,
        members: assignedMembers
      })
    })

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "letter.docx"
    a.click()
  }

  return(

    <div>

      <h1 className="text-2xl mb-6">Generate Letter</h1>

      <select
        className="border p-2"
        onChange={(e)=>setSelectedEvent(e.target.value)}
      >
        <option>Select Event</option>
        {events.map(e=>(
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      <button
        onClick={generate}
        className="ml-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Generate Letter
      </button>

    </div>

  )

}

export default GenerateLetter