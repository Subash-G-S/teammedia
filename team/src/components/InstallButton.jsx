import { useEffect, useState } from "react"

function InstallButton() {

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {

    // detect install availability
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // detect if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }

  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === "accepted") {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
  }

  // 🔥 don't show if installed or not ready
  if (isInstalled || !deferredPrompt) return null

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 
                 bg-blue-600 hover:bg-blue-700 
                 text-white px-4 py-3 rounded-lg 
                 shadow-lg z-[999]"
    >
      Install App
    </button>
  )
}

export default InstallButton