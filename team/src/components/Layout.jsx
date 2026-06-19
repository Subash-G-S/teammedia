import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import InstallButton from "./InstallButton"
import ScrollToTopButton from "./ScrollToTopButton"

function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <InstallButton />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 bg-black/20 backdrop-blur-xl border-r border-white/10">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        <Topbar />

        <div className="px-3 py-4 sm:p-6 lg:p-8">
          {children}
        </div>
        <ScrollToTopButton />

      </div>

    </div>
  )
}

export default Layout