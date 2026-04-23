import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from "../services/firebase"

function Assignments(){

  const { eventId } = useParams()
  const navigate = useNavigate()

  const [members,setMembers] = useState([])
  const [assignments,setAssignments] = useState([])

  const [selectedMember,setSelectedMember] = useState("")
  const [role,setRole] = useState("")

  const membersRef = collection(db,"members")
  const assignmentsRef = collection(db,"assignments")

  // 🔹 Fetch Members
  const fetchMembers = async () => {
    const data = await getDocs(membersRef)
    setMembers(data.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })))
  }

  // 🔹 Fetch Assignments
  const fetchAssignments = async () => {
    const data = await getDocs(assignmentsRef)
    setAssignments(data.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })))
  }

  useEffect(()=>{
    fetchMembers()
    fetchAssignments()
  },[])

  // 🔹 Assign Member
  const assignMember = async () => {

    if(!selectedMember || !role){
      alert("Fill all fields")
      return
    }

    await addDoc(assignmentsRef,{
      memberId: selectedMember,
      eventId: eventId,
      role: role
    })

    setSelectedMember("")
    setRole("")

    fetchAssignments()
  }

  // 🔹 Filter current event assignments
  const currentAssignments = assignments.filter(a => a.eventId === eventId)

  return(

    <div>

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-semibold">
          Event Assignments
        </h1>

        <button
          onClick={()=>navigate("/events")}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          ← Back
        </button>

      </div>

      {/* NO ASSIGNMENTS */}

      {currentAssignments.length === 0 ? (

        <div className="bg-yellow-100 p-6 rounded shadow">

          <p className="text-lg font-medium">
            No one assigned yet.
          </p>

          <button
            onClick={()=>{}}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Assign Members Below
          </button>

        </div>

      ) : (

        <div className="bg-white rounded shadow mb-6">

          <table className="w-full">

            <thead className="border-b">
              <tr>
                <th className="p-3 text-left">Member</th>
                <th className="p-3 text-left">Role</th>
              </tr>
            </thead>

            <tbody>

              {currentAssignments.map(a => {

                const member = members.find(m => m.id === a.memberId)

                return (
                  <tr key={a.id} className="border-b">

                    <td className="p-3">
                      {member?.name || "Unknown"}
                    </td>

                    <td className="p-3">
                      {a.role}
                    </td>

                  </tr>
                )

              })}

            </tbody>

          </table>

        </div>

      )}

      {/* ASSIGN FORM */}

      <div className="bg-white p-6 rounded shadow">

        <h2 className="text-lg font-semibold mb-4">
          Assign Member
        </h2>

        <div className="grid grid-cols-3 gap-4">

          {/* Member Dropdown */}

          <select
            className="border p-2"
            value={selectedMember}
            onChange={(e)=>setSelectedMember(e.target.value)}
          >
            <option value="">Select Member</option>

            {members.map(m=>(
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}

          </select>

          {/* Role Input */}

          <input
            placeholder="Role"
            className="border p-2"
            value={role}
            onChange={(e)=>setRole(e.target.value)}
          />

          {/* Button */}

          <button
            onClick={assignMember}
            className="bg-green-600 text-white rounded"
          >
            Assign
          </button>

        </div>

      </div>

    </div>

  )

}

export default Assignments