import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import Loader from "../components/Loader"

function Assignments(){

  const { eventId } = useParams()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef()

  const [members,setMembers] = useState([])
  const [assignments,setAssignments] = useState([])
  const [selectedMember,setSelectedMember] = useState("")
  const [role,setRole] = useState("")
  const [loading,setLoading] = useState(true)

  const membersRef = collection(db,"members")
  const assignmentsRef = collection(db,"assignments")

  const fetchData = async () => {
    try{
      setLoading(true)

      const m = await getDocs(membersRef)
      const a = await getDocs(assignmentsRef)

      setMembers(m.docs.map(doc => ({...doc.data(), id: doc.id})))
      setAssignments(a.docs.map(doc => ({...doc.data(), id: doc.id})))

    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchData()
  },[])

  // 🔥 close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const assignMember = async () => {

    if(!selectedMember || !role){
      alert("Fill all fields")
      return
    }

    await addDoc(assignmentsRef,{
      memberId: selectedMember,
      eventId,
      role
    })

    setSelectedMember("")
    setRole("")
    fetchData()
  }

  const currentAssignments = assignments.filter(a => a.eventId === eventId)

  if (loading) return <Loader />

  return(

    <div className="space-y-6">

      {/* 🔥 HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

        <h1 className="text-2xl font-semibold text-white">
          Assignments
        </h1>

        <button
          onClick={()=>navigate("/events")}
          className="w-fit px-4 py-2 bg-white/10 rounded-lg text-sm"
        >
          ← Back
        </button>

      </div>

      {/* 🔥 ASSIGNED MEMBERS (MOBILE FRIENDLY CARDS) */}

      {currentAssignments.length === 0 ? (

        <div className="bg-white/10 border border-white/10 p-4 sm:p-6 rounded-xl">
          <p>No one assigned yet.</p>
        </div>

      ) : (

        <div className="space-y-3">

          {currentAssignments.map(a => {

            const member = members.find(m => m.id === a.memberId)

            return (
              <div
                key={a.id}
                className="bg-white/10 border border-white/10 p-4 rounded-xl"
              >
                <p className="text-xs text-gray-400">Member</p>
                <p className="font-semibold">{member?.name}</p>

                <p className="text-xs text-gray-400 mt-2">Role</p>
                <p>{a.role}</p>
              </div>
            )
          })}

        </div>

      )}

      {/* 🔥 FORM */}

      <div className="bg-white/10 border border-white/10 p-4 sm:p-6 rounded-xl relative overflow-visible">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* 🔥 CUSTOM DROPDOWN */}
          <div className="relative" ref={dropdownRef}>

            <button
              onClick={() => setOpen(!open)}
              className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-left text-sm"
            >
              {
                members.find(m => m.id === selectedMember)?.name || "Select Member"
              }
            </button>

            {open && (
              <div className="absolute mt-2 w-full bg-slate-900 border border-white/10 
                              rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">

                <input
                  placeholder="Search..."
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  className="w-full p-3 bg-transparent border-b border-white/10 
                             outline-none text-sm"
                />

                {filteredMembers.length === 0 ? (
                  <p className="p-2 text-sm text-gray-400">
                    No members found
                  </p>
                ) : (
                  filteredMembers.map(m => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMember(m.id)
                        setOpen(false)
                        setSearch("")
                      }}
                      className="p-3 hover:bg-white/10 cursor-pointer"
                    >
                      {m.name}
                    </div>
                  ))
                )}

              </div>
            )}

          </div>

          {/* ROLE INPUT */}
          <input
            placeholder="Role"
            className="bg-white/10 border border-white/20 p-3 rounded-lg text-white text-sm"
            value={role}
            onChange={(e)=>setRole(e.target.value)}
          />

          {/* BUTTON */}
          <button
            onClick={assignMember}
            className="w-full sm:w-auto 
                       bg-green-500 hover:bg-green-600 
                       py-3 px-4 
                       rounded-lg 
                       text-white 
                       shadow-lg transition"
          >
            Assign
          </button>

        </div>

      </div>

    </div>

  )
}

export default Assignments