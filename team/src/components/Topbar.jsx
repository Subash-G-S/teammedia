import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"
import Sidebar from "./Sidebar"

function Topbar() {

  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/")
  }

  // 🔥 prevent scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto"
  }, [open])

  return (

    <>
      {/* TOPBAR */}
      <div className="h-16 bg-white/10 backdrop-blur-xl border-b border-white/10 
                      flex items-center justify-between px-4">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          <button
            className="md:hidden text-white text-xl"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>

          <h2 className="text-white font-semibold text-lg">
            Team Media
          </h2>

        </div>

        {/* RIGHT */}
        <button
          onClick={handleLogout}
          className="bg-red-500/80 hover:bg-red-600 
                     px-4 py-2 rounded-lg 
                     transition text-white"
        >
          Logout
        </button>

      </div>

      {/* 🔥 MOBILE SIDEBAR */}
      {open && (
        <div className="fixed inset-0 z-50">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* drawer */}
          <div className="absolute left-0 top-0 h-full w-64 
                          bg-slate-900/95 backdrop-blur-xl 
                          border-r border-white/10 p-6">

            <button
              className="text-white mb-4"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            {/* 🔥 pass close function */}
            <Sidebar closeSidebar={() => setOpen(false)} />

          </div>

        </div>
      )}

    </>
  )
}

export default Topbar