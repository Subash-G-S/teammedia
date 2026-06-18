import { useState, useEffect } from "react"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"
import { useNavigate } from "react-router-dom"

function Checklists() {

  const [title, setTitle] = useState("")
  const [checklists, setChecklists] = useState([])

  const navigate = useNavigate()

  const fetchChecklists = async () => {

    const data = await getDocs(collection(db, "checklists"))

    setChecklists(
      data.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    )
  }

  useEffect(() => {
    fetchChecklists()
  }, [])

  const createChecklist = async () => {

    if (!title) return

    await addDoc(collection(db, "checklists"), {
      title,
      createdAt: Date.now()
    })

    setTitle("")
    fetchChecklists()
  }

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Checklists
      </h1>

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">

        <div className="flex flex-col md:flex-row gap-3">

          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            placeholder="Checklist Name"
            className="flex-1 bg-white/10 border border-white/20 p-3 rounded-xl"
          />

          <button
            onClick={createChecklist}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl text-white"
          >
            Create Checklist
          </button>

        </div>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

        {checklists.map(list => (

          <div
            key={list.id}
            onClick={() => navigate(`/checklists/${list.id}`)}
            className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-2xl cursor-pointer hover:scale-[1.02] transition"
          >
            <h2 className="font-semibold text-lg">
              {list.title}
            </h2>
          </div>

        ))}

      </div>

    </div>
  )
}

export default Checklists