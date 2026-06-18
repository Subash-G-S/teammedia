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

```
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
```

}

useEffect(() => {
fetchData()
}, [])

const toggleMember = async (memberId) => {

```
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
```

}

const filteredMembers = members.filter(member =>
member.name?.toLowerCase().includes(search.toLowerCase()) ||
member.rollNo?.toLowerCase().includes(search.toLowerCase())
)

const completedMembers = filteredMembers.filter(member => {

```
const item = items.find(
  i =>
    i.checklistId === id &&
    i.memberId === member.id
)

return item?.completed
```

})

const pendingMembers = filteredMembers.filter(member => {

```
const item = items.find(
  i =>
    i.checklistId === id &&
    i.memberId === member.id
)

return !item?.completed
```

})

const progress =
members.length === 0
? 0
: Math.round(
(completedMembers.length / members.length) * 100
)

return (


<div>

  <h1 className="text-3xl font-bold mb-6">
    Checklist
  </h1>

  {/* Progress */}

  <div className="mb-6">

    <div className="flex justify-between mb-2">

      <span>
        Progress
      </span>

      <span>
        {progress}%
      </span>

    </div>

    <div className="h-3 bg-white/10 rounded-full overflow-hidden">

      <div
        className="h-full bg-green-500 transition-all duration-500"
        style={{
          width: `${progress}%`
        }}
      />

    </div>

  </div>

  {/* Search */}

  <div className="mb-6">

    <input
      type="text"
      placeholder="Search Name or Roll Number..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full bg-white/10 border border-white/20
                 p-3 rounded-xl"
    />

  </div>

  <div className="space-y-8">

    {/* Submitted */}

    <div>

      <h2 className="text-green-400 text-xl font-semibold mb-4">
        ✅ Submitted ({completedMembers.length})
      </h2>

      <div className="space-y-3">

        {completedMembers.map(member => (

          <div
            key={member.id}
            onClick={() => toggleMember(member.id)}
            className="bg-green-500/10 border border-green-500/20
                       p-4 rounded-2xl cursor-pointer
                       flex justify-between items-center
                       hover:bg-green-500/20 transition"
          >

            <div>

              <p className="font-medium">
                {member.name}
              </p>

              <p className="text-xs text-gray-400 uppercase">
                {member.rollNo}
              </p>

            </div>

            <span className="text-xl">
              ✅
            </span>

          </div>

        ))}

      </div>

    </div>

    {/* Pending */}

    <div>

      <h2 className="text-yellow-400 text-xl font-semibold mb-4">
        ⏳ Pending ({pendingMembers.length})
      </h2>

      <div className="space-y-3">

        {pendingMembers.map(member => (

          <div
            key={member.id}
            onClick={() => toggleMember(member.id)}
            className="bg-yellow-500/10 border border-yellow-500/20
                       p-4 rounded-2xl cursor-pointer
                       flex justify-between items-center
                       hover:bg-yellow-500/20 transition"
          >

            <div>

              <p className="font-medium">
                {member.name}
              </p>

              <p className="text-xs text-gray-400 uppercase">
                {member.rollNo}
              </p>

            </div>

            <span className="text-xl">
              ⬜
            </span>

          </div>

        ))}

      </div>

    </div>

  </div>

</div>

)
}

export default ChecklistDetail
