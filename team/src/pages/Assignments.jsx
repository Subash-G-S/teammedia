import { useState, useEffect } from "react"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import { useParams } from "react-router-dom"

function Assignments(){

  const [members,setMembers] = useState([])
  const [events,setEvents] = useState([])
  const [assignments,setAssignments] = useState([])
  const { eventId } = useParams()

  const [selectedMember,setSelectedMember] = useState("")
  const [role,setRole] = useState("")

  const membersRef = collection(db,"members")
  const eventsRef = collection(db,"events")
  const assignmentsRef = collection(db,"assignments")

  // 🔹 Fetch Members
  const fetchMembers = async () => {
    const data = await getDocs(membersRef)
    setMembers(data.docs.map(doc => ({...doc.data(), id: doc.id})))
  }

  // 🔹 Fetch Events
  const fetchEvents = async () => {
    const data = await getDocs(eventsRef)
    setEvents(data.docs.map(doc => ({...doc.data(), id: doc.id})))
  }

  // 🔹 Fetch Assignments
  const fetchAssignments = async () => {
    const data = await getDocs(assignmentsRef)
    setAssignments(data.docs.map(doc => ({...doc.data(), id: doc.id})))
  }

  useEffect(()=>{
    fetchMembers()
    fetchEvents()
    fetchAssignments()
  },[])

  // 🔹 Assign
  const assignMember = async () => {

    if(!selectedMember || !selectedEvent || !role){
      alert("Fill all fields")
      return
    }

    await addDoc(assignmentsRef,{
      memberId: selectedMember,
      eventId: eventId,
      role: role
    })

    setRole("")
    fetchAssignments()
  }

  // 🔹 Helper functions
  const getMemberName = (id) => {
    const m = members.find(m => m.id === id)
    return m ? m.name : "Unknown"
  }

  const getEventName = (id) => {
    const e = events.find(e => e.id === id)
    return e ? e.name : "Unknown"
  }

  return(

    <div>

      <h1 className="text-2xl font-semibold mb-6">
        Assign Members
      </h1>

      {/* Form */}

      <div className="bg-white p-6 rounded shadow mb-6">

        <div className="grid grid-cols-4 gap-4">

          {/* Event Dropdown */}
          <select
            className="border p-2"
            onChange={(e)=>setSelectedEvent(e.target.value)}
          >
            <option value="">Select Event</option>
            {events.map(e=>(
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          {/* Member Dropdown */}
          <select
            className="border p-2"
            onChange={(e)=>setSelectedMember(e.target.value)}
          >
            <option value="">Select Member</option>
            {members.map(m=>(
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Role */}
          <input
            placeholder="Role"
            className="border p-2"
            value={role}
            onChange={(e)=>setRole(e.target.value)}
          />

          <button
            onClick={assignMember}
            className="bg-blue-600 text-white rounded"
          >
            Assign
          </button>

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded shadow">

        <table className="w-full">

          <thead className="border-b">
            <tr>
              <th className="p-3 text-left">Event</th>
              <th className="p-3 text-left">Member</th>
              <th className="p-3 text-left">Role</th>
            </tr>
          </thead>

          <tbody>

            {assignments
            .filter(a => a.eventId === eventId)
            .map(a=>(
              <tr key={a.id} className="border-b">

                <td className="p-3">{getEventName(a.eventId)}</td>
                <td className="p-3">{getMemberName(a.memberId)}</td>
                <td className="p-3">{a.role}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default Assignments