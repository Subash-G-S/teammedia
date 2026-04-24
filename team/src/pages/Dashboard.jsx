import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../services/firebase"
import { motion } from "framer-motion"
import Loader from "../components/Loader"

function Dashboard(){

  const [members,setMembers] = useState([])
  const [events,setEvents] = useState([])
  const [assignments,setAssignments] = useState([])
  const [loading,setLoading] = useState(true)

  // 🔥 REAL-TIME DATA
  useEffect(()=>{

    const unsubMembers = onSnapshot(collection(db,"members"), (snap)=>{
      setMembers(snap.docs.map(d=>({ id:d.id, ...d.data() })))
      setLoading(false)
    })

    const unsubEvents = onSnapshot(collection(db,"events"), (snap)=>{
      setEvents(snap.docs.map(d=>({ id:d.id, ...d.data() })))
    })

    const unsubAssignments = onSnapshot(collection(db,"assignments"), (snap)=>{
      setAssignments(snap.docs.map(d=>({ id:d.id, ...d.data() })))
    })

    return ()=>{
      unsubMembers()
      unsubEvents()
      unsubAssignments()
    }

  },[])

  if (loading) return <Loader />

  // 🔥 INSIGHTS

  // Role distribution
  const roleCount = {}
  members.forEach(m=>{
    roleCount[m.role] = (roleCount[m.role] || 0) + 1
  })

  const topRole = Object.keys(roleCount).reduce((a,b)=>
    roleCount[a] > roleCount[b] ? a : b, "None"
  )

  // Most active member
  const memberLoad = {}
  assignments.forEach(a=>{
    memberLoad[a.memberId] = (memberLoad[a.memberId] || 0) + 1
  })

  const mostActiveId = Object.keys(memberLoad).reduce((a,b)=>
    memberLoad[a] > memberLoad[b] ? a : b, null
  )

  const mostActiveMember = members.find(m=>m.id === mostActiveId)

  // 🔥 COUNTER COMPONENT
  const Counter = ({ value }) => {
    const [count,setCount] = useState(0)

    useEffect(()=>{
      let start = 0
      const duration = 600
      const increment = value / (duration / 16)

      const timer = setInterval(()=>{
        start += increment
        if(start >= value){
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      },16)

      return ()=>clearInterval(timer)
    },[value])

    return <span>{count}</span>
  }

  return(

    <div>

      {/* 🔥 HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-semibold text-white">
          Welcome Subash 👋
        </h1>

        <p className="text-gray-400 mt-2">
          Your team is active. Here's a quick overview.
        </p>

      </div>

      {/* 🔥 STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

        {[
          { label: "Members", value: members.length },
          { label: "Events", value: events.length },
          { label: "Assignments", value: assignments.length }
        ].map((item,i)=>(

          <motion.div
            key={i}
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 
                       p-6 rounded-xl shadow-lg"
          >

            <h3 className="text-gray-300 text-sm">
              {item.label}
            </h3>

            <p className="text-3xl font-bold mt-2 text-white">
              <Counter value={item.value} />
            </p>

          </motion.div>

        ))}

      </div>

      {/* 🔥 INSIGHTS PANEL */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 
                        p-6 rounded-xl shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            Insights
          </h2>

          <p className="text-gray-300 text-sm">
            Most common role: <span className="text-white">{topRole}</span>
          </p>

          <p className="text-gray-300 text-sm mt-2">
            Most active member:{" "}
            <span className="text-white">
              {mostActiveMember ? mostActiveMember.name : "None"}
            </span>
          </p>

        </div>

        {/* 🔥 ACTIVITY */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 
                        p-6 rounded-xl shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            Recent Activity
          </h2>

          <div className="space-y-2 text-sm text-gray-300">

            {assignments.slice(0,5).map((a,i)=>{
              const member = members.find(m=>m.id === a.memberId)
              return (
                <p key={i}>
                  {member?.name || "Someone"} assigned as {a.role}
                </p>
              )
            })}

            {members.slice(0,3).map((m,i)=>(
              <p key={i}>
                New member added: {m.name}
              </p>
            ))}

          </div>

        </div>

      </div>

    </div>

  )

}

export default Dashboard