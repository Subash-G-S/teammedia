// ChecklistDetail.jsx

import { useState, useEffect } from "react"
import {
collection,
getDocs,
addDoc,
updateDoc,
doc
} from "firebase/firestore"

import { db } from "../services/firebase"
import { useParams } from "react-router-dom"

function ChecklistDetail() {

const { id } = useParams()

const [members, setMembers] = useState([])
const [items, setItems] = useState([])
const [search, setSearch] = useState("")

const fetchData = async () => {


const memberData = await getDocs(
  collection(db, "members")
)

const itemData = await getDocs(
  collection(db, "checklistItems")
)

setMembers(
  memberData.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
)

setItems(
  itemData.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
)


}

useEffect(() => {
fetchData()
}, [])

const toggleMember = async (memberId) => {


const existing = items.find(
  item =>
    item.checklistId === id &&
    item.memberId === memberId
)

if (existing) {

  await updateDoc(
    doc(db, "checklistItems", existing.id),
    {
      completed: !existing.completed
    }
  )

} else {

  await addDoc(
    collection(db, "checklistItems"),
    {
      checklistId: id,
      memberId,
      completed: true
    }
  )

}

fetchData()


}

const filteredMembers = members.filter(member =>
member.name?.toLowerCase().includes(search.toLowerCase()) ||
member.rollNo?.toLowerCase().includes(search.toLowerCase())
)

const completedMembers = filteredMembers.filter(member => {


const item = items.find(
  i =>
    i.checklistId === id &&
    i.memberId === member.id
)

return item?.completed


})

const pendingMembers = filteredMembers.filter(member => {


const item = items.find(
  i =>
    i.checklistId === id &&
    i.memberId === member.id
)

return !item?.completed


})

const progress =
members.length === 0
? 0
: Math.round(
(completedMembers.length / members.length) * 100
)

const getRoleIcon = (role) => {


switch(role){

  case "Photographer":
    return "📸"

  case "Videographer":
    return "🎥"

  case "Video Editor":
    return "🎬"

  case "Designer":
    return "🎨"

  default:
    return "👤"
}


}

return (


<div className="space-y-6">

  {/* Hero Card */}

  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl">

    <h1 className="text-3xl font-bold">
      Checklist Tracker
    </h1>

    <p className="mt-2 text-white/80">
      Track member submissions efficiently
    </p>

    <div className="mt-4">

      <div className="flex justify-between text-sm mb-2">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>

      <div className="h-3 bg-white/20 rounded-full overflow-hidden">

        <div
          className="h-full bg-white transition-all duration-500"
          style={{
            width: `${progress}%`
          }}
        />

      </div>

    </div>

  </div>

  {/* Stats */}

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <p className="text-sm text-gray-400">
        Total Members
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {members.length}
      </h2>
    </div>

    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
      <p className="text-sm text-green-300">
        Submitted
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {completedMembers.length}
      </h2>
    </div>

    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
      <p className="text-sm text-yellow-300">
        Pending
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {pendingMembers.length}
      </h2>
    </div>

  </div>

  {/* Search */}

  <div>

    <input
      type="text"
      placeholder="Search Name or Roll Number..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl"
    />

  </div>

  {/* Pending Section */}

  <div>

    <h2 className="text-2xl font-bold text-yellow-400 mb-4">
      ⏳ Pending ({pendingMembers.length})
    </h2>

    <div className="space-y-3">

      {pendingMembers.map(member => (

        <div
          key={member.id}
          onClick={() => toggleMember(member.id)}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-4 cursor-pointer hover:scale-[1.01] transition-all duration-300"
        >

          <div className="flex justify-between items-center">

            <div className="flex gap-4">

              <div className="w-12 h-12 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center">
                {member.name?.charAt(0)}
              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  {member.name}
                </h3>

                <p className="text-sm text-gray-400 uppercase">
                  {member.rollNo}
                </p>

                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/10 text-xs">
                  {getRoleIcon(member.role)} {member.role}
                </span>

              </div>

            </div>

            <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold">
              Mark Done
            </button>

          </div>

        </div>

      ))}

    </div>

  </div>

  {/* Submitted Section */}

  <div>

    <h2 className="text-2xl font-bold text-green-400 mb-4">
      ✅ Submitted ({completedMembers.length})
    </h2>

    <div className="space-y-3">

      {completedMembers.map(member => (

        <div
          key={member.id}
          onClick={() => toggleMember(member.id)}
          className="bg-green-500/10 border border-green-500/20 rounded-3xl p-4 cursor-pointer hover:scale-[1.01] transition-all duration-300"
        >

          <div className="flex justify-between items-center">

            <div className="flex gap-4">

              <div className="w-12 h-12 rounded-full bg-green-500 text-black font-bold flex items-center justify-center">
                {member.name?.charAt(0)}
              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  {member.name}
                </h3>

                <p className="text-sm text-gray-400 uppercase">
                  {member.rollNo}
                </p>

                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/10 text-xs">
                  {getRoleIcon(member.role)} {member.role}
                </span>

              </div>

            </div>

            <button className="bg-green-500 text-black px-4 py-2 rounded-xl font-semibold">
              Submitted
            </button>

          </div>

        </div>

      ))}

    </div>

  </div>

</div>

)
}

export default ChecklistDetail
