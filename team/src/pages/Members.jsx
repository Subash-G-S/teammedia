import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../services/firebase"
import Loader from "../components/Loader"

function Members() {

  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [assignments, setAssignments] = useState([])

  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [role, setRole] = useState("")
  const [search, setSearch] = useState("")

  const membersRef = collection(db, "members")
  const assignmentsRef = collection(db, "assignments")

  // 🔹 Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true)

      const membersData = await getDocs(membersRef)
      const assignmentsData = await getDocs(assignmentsRef)

      setMembers(
        membersData.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }))
      )

      setAssignments(
        assignmentsData.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }))
      )

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🔹 Add Member
  const addMember = async () => {

    if (!name || !department || !role) return

    await addDoc(membersRef, {
      name,
      department,
      role
    })

    setName("")
    setDepartment("")
    setRole("")

    fetchData()
  }

  // 🔹 Delete Member
  const deleteMember = async (id) => {

    const memberDoc = doc(db, "members", id)

    await deleteDoc(memberDoc)

    fetchData()
  }

  // 🔹 Filter members (search)
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Loader />

  return (

    <div>

      <h1 className="text-2xl font-semibold mb-6 text-white">
        Members
      </h1>

      {/* 🔥 ADD MEMBER */}

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 
                      p-6 rounded-xl shadow-lg mb-6">

        <h2 className="text-lg font-semibold mb-4">
          Add Member
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <input
            placeholder="Name"
            className="bg-white/10 border border-white/20 p-2 rounded-lg text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Roll No"
            className="bg-white/10 border border-white/20 p-2 rounded-lg text-white"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <input
            placeholder="Role"
            className="bg-white/10 border border-white/20 p-2 rounded-lg text-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <button
            onClick={addMember}
            className="bg-blue-500 hover:bg-blue-600 
                       shadow-lg hover:shadow-blue-500/40 
                       rounded-lg transition text-white"
          >
            Add
          </button>

        </div>

      </div>

      {/* 🔥 SEARCH */}

      <div className="mb-6">

        <input
          placeholder="Search members..."
          className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* 🔥 MEMBERS GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredMembers.map(member => {

          // 🔹 count assignments
          const count = assignments.filter(a => a.memberId === member.id).length

          return (

            <div
              key={member.id}
              className="bg-white/10 backdrop-blur-xl border border-white/10 
                         p-5 rounded-xl shadow-lg 
                         hover:shadow-blue-500/20 
                         transition"
            >

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mb-3">
                {member.name.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-lg font-semibold">
                {member.name}
              </h3>

              <p className="text-sm text-gray-300">
                {member.department}
              </p>

              <p className="text-sm text-blue-400 mt-1">
                {member.role}
              </p>

              {/* Assignment count */}
              <p className="text-xs text-gray-400 mt-2">
                Assigned to {count} event{count !== 1 && "s"}
              </p>

              <button
                onClick={() => deleteMember(member.id)}
                className="mt-4 text-red-400 hover:text-red-500 text-sm"
              >
                Delete
              </button>

            </div>

          )
        })}

      </div>

    </div>
  )
}

export default Members