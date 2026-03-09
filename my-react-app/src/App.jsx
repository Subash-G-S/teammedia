import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Members from "./pages/Members"
import Events from "./pages/Events"
import Assignments from "./pages/Assignments"
import GenerateLetter from "./pages/GenerateLetter"

import Layout from "./components/Layout"
import { auth } from "./services/firebase"



function ProtectedRoute({ children }) {

  const user = auth.currentUser

  if (!user) {
    return <Navigate to="/" />
  }

  return children
}



function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route path="/" element={<Login />} />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* MEMBERS */}

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Layout>
                <Members />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* EVENTS */}

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout>
                <Events />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* ASSIGNMENTS */}

        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <Layout>
                <Assignments />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* LETTER GENERATOR */}

        <Route
          path="/letters"
          element={
            <ProtectedRoute>
              <Layout>
                <GenerateLetter />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  )
}

export default App