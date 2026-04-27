import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../services/firebase"
import { useNavigate } from "react-router-dom"

function Login() {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {

    setError("")

    try {
      await signInWithEmailAndPassword(auth,email,password)
      sessionStorage.setItem("justLoggedIn", "true")
      navigate("/dashboard")
    } catch(err) {
      setError("Invalid email or password")
    }

  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black-900 to-yellow-800">

      <div className="bg-yellow p-8 rounded-2xl shadow-xl w-[350px]">

        <h2 className="text-2xl font-bold mb-6 text-center text-white-800">
          Admin Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
        >
          Login
        </button>

      </div>

    </div>
  )
}

export default Login