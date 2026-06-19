import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaArrowUp } from "react-icons/fa"

function ScrollToTopButton() {

const [visible, setVisible] = useState(false)

useEffect(() => {


const handleScroll = () => {
  setVisible(window.scrollY > 300)
}

window.addEventListener("scroll", handleScroll)

return () =>
  window.removeEventListener("scroll", handleScroll)


}, [])

const scrollToTop = () => {


window.scrollTo({
  top: 0,
  behavior: "smooth"
})


}

return (


<AnimatePresence>

  {visible && (

    <motion.button

      initial={{
        opacity: 0,
        scale: 0.5,
        y: 100
      }}

      animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }}

      exit={{
        opacity: 0,
        scale: 0.5,
        y: 100
      }}

      whileHover={{
        scale: 1.15,
        rotate: -10
      }}

      whileTap={{
        scale: 0.9
      }}

      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}

      onClick={scrollToTop}

      className="
        fixed
        bottom-24
        right-4
        sm:right-6
        z-[999]
        w-14
        h-14
        rounded-full

        bg-white/10
        backdrop-blur-xl

        border
        border-white/20

        text-white

        shadow-[0_0_25px_rgba(255,255,255,0.15)]

        flex
        items-center
        justify-center
      "
    >

      <FaArrowUp size={18} />

    </motion.button>

  )}

</AnimatePresence>


)
}

export default ScrollToTopButton
