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

  const fetchData = async () => {

    const memberData = await getDocs(collection(db, "members"))

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

  return (

    <div>

      <h1 className="text-3xl font-bold mb-6">
        Checklist
      </h1>

      <div className="space-y-3">

        {members.map(member => {

          const item = items.find(
            i =>
              i.checklistId === id &&
              i.memberId === member.id
          )

          const completed = item?.completed || false

          return (

            <div
              key={member.id}
              onClick={() => toggleMember(member.id)}
              className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl cursor-pointer flex justify-between items-center hover:bg-white/20 transition"
            >

              <span>
                {member.name}
              </span>

              <span className="text-xl">
                {completed ? "✅" : "⬜"}
              </span>

            </div>

          )

        })}

      </div>

    </div>

  )
}

export default ChecklistDetail