import { Link, useLocation } from "react-router-dom"

function Sidebar({ closeSidebar }) {

  const location = useLocation()

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Members", path: "/members" },
    { name: "Events", path: "/events" }
  ]

  return (

    <div className="w-full text-white">

      <h1 className="text-xl font-bold mb-6">
        TEAM MEDIA
      </h1>

      <div className="space-y-2">

        {links.map(link => (

          <Link
            key={link.path}
            to={link.path}
            onClick={closeSidebar}  // 🔥 THIS IS THE FIX
            className={`block px-4 py-2 rounded-lg transition ${
              location.pathname.startsWith(link.path)
                ? "bg-white/20"
                : "hover:bg-white/10"
            }`}
          >
            {link.name}
          </Link>

        ))}

      </div>

    </div>
  )
}

export default Sidebar