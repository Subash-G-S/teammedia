import { Link } from "react-router-dom"

function Sidebar() {

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col p-6">

      <h1 className="text-2xl font-bold mb-10">
        TEAM MEDIA
      </h1>

      <nav className="flex flex-col gap-4">

        <Link to="/dashboard" className="hover:text-blue-400">
          Dashboard
        </Link>

        <Link to="/members" className="hover:text-blue-400">
          Members
        </Link>

        <Link to="/events" className="hover:text-blue-400">
          Events
        </Link>

        <Link to="/assignments" className="hover:text-blue-400">
          Assignments
        </Link>

        <Link to="/letters" className="hover:text-blue-400">
          Letters
        </Link>

      </nav>

    </div>
  )

}

export default Sidebar