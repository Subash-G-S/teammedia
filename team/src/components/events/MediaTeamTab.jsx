import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import MemberCard from "./MemberCard"
import MemberHistoryModal from "./MemberHistoryModal"
import { getRollNumber, normalizeStatus, roleMatches } from "./eventUtils"

const filters = ["All", "Assigned", "Covered", "Absent", "Photographers", "Videographers", "Video Editors", "Designers"]
const roles = ["Photographer", "Videographer", "Video Editor", "Designer", "Head", "Advisor"]
const MotionDiv = motion.div
const MotionButton = motion.button

function MediaTeamTab({ members, assignments, allAssignments, onAssign, onStatusChange }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [selectedMember, setSelectedMember] = useState("")
  const [memberSearch, setMemberSearch] = useState("")
  const [memberPickerOpen, setMemberPickerOpen] = useState(false)
  const [role, setRole] = useState("")
  const [historyMember, setHistoryMember] = useState(null)
  const formRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setMemberPickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase()

    if (!query) return members

    return members.filter(member => {
      const haystack = `${member.name || ""} ${getRollNumber(member)} ${member.role || ""}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [memberSearch, members])

  const selectedMemberData = members.find(member => member.id === selectedMember)

  const visibleAssignments = useMemo(() => {
    return assignments
      .filter(assignment => {
        const member = members.find(m => m.id === assignment.memberId) || {}
        const haystack = `${member.name || ""} ${getRollNumber(member)} ${assignment.role || ""}`.toLowerCase()
        const matchesSearch = haystack.includes(search.toLowerCase())
        const status = normalizeStatus(assignment)
        const matchesFilter = filter === "All" || status === filter || roleMatches(assignment.role || member.role, filter)
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        const aStatus = normalizeStatus(a)
        const bStatus = normalizeStatus(b)
        if (aStatus === "Assigned" && bStatus !== "Assigned") return -1
        if (aStatus !== "Assigned" && bStatus === "Assigned") return 1
        return (a.assignedAt || 0) - (b.assignedAt || 0)
      })
  }, [assignments, filter, members, search])

  const assignMember = async () => {
    if (!selectedMember || !role) {
      alert("Select a member and role")
      return
    }
    await onAssign(selectedMember, role)
    setSelectedMember("")
    setMemberSearch("")
    setMemberPickerOpen(false)
    setRole("")
  }

  return (
    <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div ref={formRef} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMemberPickerOpen(open => !open)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3 text-left text-sm text-white outline-none transition hover:bg-slate-900/80"
            >
              <span className={selectedMemberData ? "text-white" : "text-white/40"}>
                {selectedMemberData ? `${selectedMemberData.name} - ${getRollNumber(selectedMemberData)}` : "Search and select member"}
              </span>
              <Search size={16} className="shrink-0 text-white/40" />
            </button>

            {memberPickerOpen && (
              <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/30">
                <div className="relative border-b border-white/10">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={17} />
                  <input
                    autoFocus
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search name, roll number or role"
                    className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto p-2">
                  {filteredMembers.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-white/45">No members found</p>
                  ) : (
                    filteredMembers.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setSelectedMember(member.id)
                          setMemberSearch("")
                          setMemberPickerOpen(false)
                        }}
                        className={`w-full rounded-xl p-3 text-left transition hover:bg-white/10 ${selectedMember === member.id ? "bg-white/10" : ""}`}
                      >
                        <span className="block font-semibold text-white">{member.name}</span>
                        <span className="mt-1 block text-xs text-white/45">
                          {getRollNumber(member)} - {member.role || "Media"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none">
            <option value="">Select Role</option>
            {roles.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <MotionButton whileTap={{ scale: 0.97 }} onClick={assignMember} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500">
            Assign Member
          </MotionButton>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:max-w-sm lg:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, roll number or role" className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(item => (
            <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${filter === item ? "bg-white text-slate-950" : "bg-white/10 text-white/75 hover:bg-white/15"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {visibleAssignments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center text-white/60">
          No media team members match this view.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleAssignments.map(assignment => (
            <MemberCard
              key={assignment.id}
              assignment={assignment}
              member={members.find(m => m.id === assignment.memberId)}
              onStatusChange={onStatusChange}
              onOpenHistory={setHistoryMember}
            />
          ))}
        </div>
      )}

      <MemberHistoryModal member={historyMember} assignments={allAssignments} onClose={() => setHistoryMember(null)} />
    </MotionDiv>
  )
}

export default MediaTeamTab
