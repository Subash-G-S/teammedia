import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import InstallButton from "./InstallButton"
import ScrollToTopButton from "./ScrollToTopButton"

function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <InstallButton />

      {/* Desktop Sidebar */}
      <div
  className="
    hidden
    md:flex
    fixed
    left-0
    top-0
    h-screen
    w-64
    bg-black/20
    backdrop-blur-xl
    border-r
    border-white/10
    z-40
  "
>
  <Sidebar />
</div>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-64">

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