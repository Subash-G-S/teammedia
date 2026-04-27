import { useEffect, useState } from "react"

function InstallButton() {

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showButton, setShowButton] = useState(
    localStorage.getItem("installDismissed") !== "true"
  )

  useEffect(() => {

    const handler = (e) => {
      e.preventDefault()

      setDeferredPrompt(e)

      // 🔥 persist that install is available
      localStorage.setItem("installAvailable", "true")

      setShowButton(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // 🔥 if previously available, still show
    if (localStorage.getItem("installAvailable") === "true") {
      setShowButton(true)
    }

    // 🔥 if already installed → hide forever
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowButton(false)
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
      localStorage.setItem("installDismissed", "true")
      setShowButton(false)
    }
  }

  if (!showButton) return null

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