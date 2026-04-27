import { useEffect, useState } from "react"

let deferredPromptGlobal = null   // 🔥 persists across renders

function InstallButton() {

  const [isAvailable, setIsAvailable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {

    // 🔥 capture install event
    const handler = (e) => {
      e.preventDefault()
      deferredPromptGlobal = e
      setIsAvailable(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // 🔥 detect installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }

  }, [])

  const handleInstall = async () => {

    // ❌ No prompt available
    if (!deferredPromptGlobal) {
      alert("Install not available yet. Use Chrome menu → Add to Home Screen.")
      return
    }

    // ✅ Trigger install
    deferredPromptGlobal.prompt()

    const choice = await deferredPromptGlobal.userChoice

    if (choice.outcome === "accepted") {
      setIsInstalled(true)
    }

    deferredPromptGlobal = null
  }

  if (isInstalled || !isAvailable) return null

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 
                 bg-blue-600 hover:bg-blue-700 
                 text-white px-4 py-3 rounded-lg 
                 shadow-lg z-[999]"
    >
      Install App
    </button>
  )
}

export default InstallButton