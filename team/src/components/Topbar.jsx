import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"
import { useNavigate } from "react-router-dom"

function Topbar(){

  const navigate = useNavigate()

  const handleLogout = async () => {

    await signOut(auth)

    navigate("/")   // go back to login

  }

  return(

    <div className="h-16 bg-white border-b flex items-center justify-between px-6">

      <h2 className="font-semibold text-lg">
        Dashboard
      </h2>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>

    </div>

  )

}

export default Topbar