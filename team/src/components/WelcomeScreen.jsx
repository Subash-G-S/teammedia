import { motion } from "framer-motion"
import { useEffect } from "react"

function WelcomeScreen({ name, onFinish }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish()
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-gradient-to-br from-slate-900 to-black"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-5xl font-semibold text-white"
      >
        Welcome, {name}
      </motion.h1>
    </motion.div>
  )
}

export default WelcomeScreen