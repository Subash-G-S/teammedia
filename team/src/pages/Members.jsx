import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../services/firebase"
import Loader from "../components/Loader"

function Members() {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [role, setRole] = useState("")

  const membersRef = collection(db, "members")

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await getDocs(membersRef)

      const list = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }))

      setMembers(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
    
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const addMember = async () => {

    if(!name || !department || !role) return

    await addDoc(membersRef,{
      name,
      department,
      role
    })

    setName("")
    setDepartment("")
    setRole("")

    fetchMembers()
  }

  const deleteMember = async (id) => {

    const memberDoc = doc(db,"members",id)

    await deleteDoc(memberDoc)

    fetchMembers()
  }
  if (loading) return <Loader />
  return (

    <div>

      <h1 className="text-2xl font-semibold mb-6">
        Members
      </h1>

      {/* Add Member Form */}

      <div className="bg-white p-6 rounded shadow mb-8">

        <h2 className="text-lg font-semibold mb-4">
          Add Member
        </h2>

        <div className="grid grid-cols-4 gap-4">

          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Department"
            value={department}
            onChange={(e)=>setDepartment(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Role"
            value={role}
            onChange={(e)=>setRole(e.target.value)}
          />

          <button
            onClick={addMember}
            className="bg-blue-600 text-white rounded"
          >
            Add
          </button>

        </div>

      </div>


      {/* Members Table */}

      <div className="bg-white rounded shadow">

        <table className="w-full">

          <thead className="border-b">

            <tr className="text-left">

              <th className="p-3">Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Role</th>
              <th className="p-3">Action</th>

            </tr>

          </thead>

          <tbody>

            {members.map((member)=>(
              <tr key={member.id} className="border-b">

                <td className="p-3">{member.name}</td>
                <td className="p-3">{member.department}</td>
                <td className="p-3">{member.role}</td>

                <td className="p-3">

                  <button
                    onClick={()=>deleteMember(member.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  )
}

export default Members