import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import Loader from "./components/Loader"
import { auth } from "./services/firebase"
import { usersMap } from "./data/users"
import WelcomeScreen from "./components/WelcomeScreen"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Members from "./pages/Members"
import Events from "./pages/Events"
import Assignments from "./pages/Assignments"
import GenerateLetter from "./pages/GenerateLetter"

import Layout from "./components/Layout"

function App() {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(
    sessionStorage.getItem("welcomeShown") !== "true"
  )

  const name =
    usersMap[user?.email] ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User"

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (user && showWelcome) {
    return (
      <WelcomeScreen
        name={name}
        onFinish={() => {
          sessionStorage.setItem("welcomeShown", "true")
          setShowWelcome(false)
        }}
      />
   )
  }

  if (loading) return <Loader />

  return (

    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            user
              ? <Layout><Dashboard /></Layout>
              : <Navigate to="/" />
          }
        />

        {/* Members */}
        <Route
          path="/members"
          element={
            user
              ? <Layout><Members /></Layout>
              : <Navigate to="/" />
          }
        />

        {/* Events */}
        <Route
          path="/events"
          element={
            user
              ? <Layout><Events /></Layout>
              : <Navigate to="/" />
          }
        />

        {/* Assignments */}
        <Route
          path="/assignments"
          element={
            user
              ? <Layout><Assignments /></Layout>
              : <Navigate to="/" />
          }
        />

        {/* Letters */}
        <Route
          path="/letters"
          element={
            user
              ? <Layout><GenerateLetter /></Layout>
              : <Navigate to="/" />
          }
        />

        <Route
          path="/events/:id"
          element={
            <Layout>
              <Events />
            </Layout>
          }
        />
        <Route
  path="/assignments/:eventId"
  element={
    user
      ? <Layout><Assignments /></Layout>
      : <Navigate to="/" />
  }
/>

      </Routes>

    </BrowserRouter>

  )
}

export default App