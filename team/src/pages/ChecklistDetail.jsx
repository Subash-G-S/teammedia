import { useEffect, useMemo, useState } from "react"
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
  writeBatch
} from "firebase/firestore"
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Search,
  UserCheck,
  Users
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { db } from "../services/firebase"

const roles = ["All Roles", "Photographer", "Videographer", "Video Editor", "Designer", "Head", "Advisor"]
const statuses = ["All", "Pending", "Done"]

const getRollNumber = (member = {}) => member.rollNo || member.department || member.rollNumber || "Roll number not added"

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("") || "M"

function ChecklistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [checklist, setChecklist] = useState(null)
  const [members, setMembers] = useState([])
  const [items, setItems] = useState([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState("")
  const [bulkUpdating, setBulkUpdating] = useState(false)

  const fetchData = async () => {
    setLoading(true)

    const [checklistsSnap, membersSnap, itemsSnap] = await Promise.all([
      getDocs(collection(db, "checklists")),
      getDocs(collection(db, "members")),
      getDocs(collection(db, "checklistItems"))
    ])

    setChecklist(
      checklistsSnap.docs
        .map(item => ({ id: item.id, ...item.data() }))
        .find(item => item.id === id) || null
    )
    setMembers(
      membersSnap.docs
        .map(item => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    )
    setItems(itemsSnap.docs.map(item => ({ id: item.id, ...item.data() })))
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const itemByMember = useMemo(() => {
    return items
      .filter(item => item.checklistId === id)
      .reduce((map, item) => {
        map[item.memberId] = item
        return map
      }, {})
  }, [id, items])

  const membersWithStatus = useMemo(() => {
    return members.map(member => {
      const item = itemByMember[member.id]

      return {
        ...member,
        checklistItemId: item?.id,
        completed: Boolean(item?.completed),
        updatedAt: item?.updatedAt || item?.createdAt
      }
    })
  }, [itemByMember, members])

  const completedCount = membersWithStatus.filter(member => member.completed).length
  const pendingCount = Math.max(membersWithStatus.length - completedCount, 0)
  const progress = membersWithStatus.length ? Math.round((completedCount / membersWithStatus.length) * 100) : 0

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return membersWithStatus.filter(member => {
      const text = `${member.name || ""} ${getRollNumber(member)} ${member.role || ""}`.toLowerCase()
      const matchesSearch = !query || text.includes(query)
      const matchesRole = roleFilter === "All Roles" || member.role === roleFilter
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Done" && member.completed) ||
        (statusFilter === "Pending" && !member.completed)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [membersWithStatus, roleFilter, search, statusFilter])

  const visiblePending = filteredMembers.filter(member => !member.completed).length
  const visibleDone = filteredMembers.filter(member => member.completed).length

  const setMemberStatus = async (member, completed) => {
    setUpdatingId(member.id)

    if (member.checklistItemId) {
      await updateDoc(doc(db, "checklistItems", member.checklistItemId), {
        completed,
        updatedAt: Date.now()
      })
    } else {
      await addDoc(collection(db, "checklistItems"), {
        checklistId: id,
        memberId: member.id,
        completed,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }

    setUpdatingId("")
    fetchData()
  }

  const updateVisible = async (completed) => {
    if (filteredMembers.length === 0 || bulkUpdating) return

    setBulkUpdating(true)
    const batch = writeBatch(db)
    const now = Date.now()

    filteredMembers.forEach(member => {
      if (member.completed === completed) return

      if (member.checklistItemId) {
        batch.update(doc(db, "checklistItems", member.checklistItemId), {
          completed,
          updatedAt: now
        })
      } else {
        const ref = doc(collection(db, "checklistItems"))
        batch.set(ref, {
          checklistId: id,
          memberId: member.id,
          completed,
          createdAt: now,
          updatedAt: now
        })
      }
    })

    await batch.commit()
    setBulkUpdating(false)
    fetchData()
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white/55">
        Loading checklist...
      </div>
    )
  }

  if (!checklist) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Checklist not found</h1>
        <button onClick={() => navigate("/checklists")} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Back to checklists
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-sky-500/30 via-violet-500/25 to-emerald-400/20 p-6 shadow-2xl shadow-blue-950/30 sm:p-8">
        <button
          onClick={() => navigate("/checklists")}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 transition hover:bg-white/15"
        >
          <ArrowLeft size={16} />
          Checklists
        </button>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3 py-1 text-xs font-semibold text-white/75">
              <ClipboardCheck size={14} />
              Member checklist
            </div>
            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {checklist.title}
            </h1>
            <p className="mt-3 text-sm text-white/65">
              Use this as the working follow-up sheet for the whole media team.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-white/85 sm:grid-cols-3 lg:min-w-[28rem]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
              <p className="text-xs text-white/45">Progress</p>
              <p className="mt-1 text-2xl font-bold">{progress}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
              <p className="text-xs text-white/45">Done</p>
              <p className="mt-1 text-2xl font-bold">{completedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
              <p className="text-xs text-white/45">Pending</p>
              <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Members", value: membersWithStatus.length, icon: Users, className: "text-cyan-100 bg-cyan-400/10" },
          { label: "Completed", value: completedCount, icon: CheckCircle2, className: "text-emerald-100 bg-emerald-400/10" },
          { label: "Needs Follow-up", value: pendingCount, icon: UserCheck, className: "text-amber-100 bg-amber-400/10" }
        ].map(item => {
          const Icon = item.icon

          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">{item.label}</p>
                <div className={`rounded-xl p-2 ${item.className}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-4 text-4xl font-bold text-white">{item.value}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, roll number or role"
              className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm text-white outline-none"
          >
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>

          <div className="flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-black/15 p-1">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${statusFilter === status ? "bg-white text-slate-950" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateVisible(true)}
              disabled={bulkUpdating || filteredMembers.length === 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-45 xl:flex-none"
            >
              <CheckCircle2 size={17} />
              Mark Visible Done
            </button>
            <button
              onClick={() => updateVisible(false)}
              disabled={bulkUpdating || filteredMembers.length === 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45 xl:flex-none"
            >
              <RotateCcw size={17} />
              Reset Visible
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
          <span className="rounded-full bg-black/15 px-3 py-1">{filteredMembers.length} shown</span>
          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-100">{visiblePending} pending</span>
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-100">{visibleDone} done</span>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white/55">
          No members match the current filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-xl">
          <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-4 border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase text-white/40 lg:grid">
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-white/10">
            {filteredMembers.map(member => (
              <div key={member.id} className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr] lg:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold ${member.completed ? "bg-emerald-400/15 text-emerald-100" : "bg-amber-400/15 text-amber-100"}`}>
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">{member.name || "Unnamed member"}</h3>
                    <p className="text-sm text-white/50">{getRollNumber(member)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/40 lg:hidden">Role</p>
                  <p className="font-medium text-white/80">{member.role || "Role not set"}</p>
                </div>

                <div>
                  <p className="text-xs text-white/40 lg:hidden">Status</p>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${member.completed ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-amber-300/25 bg-amber-400/10 text-amber-100"}`}>
                    {member.completed ? "Done" : "Pending"}
                  </span>
                </div>

                <div className="flex justify-start lg:justify-end">
                  <button
                    onClick={() => setMemberStatus(member, !member.completed)}
                    disabled={updatingId === member.id}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto ${member.completed ? "border border-white/10 bg-white/10 text-white hover:bg-white/15" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"}`}
                  >
                    {member.completed ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
                    {member.completed ? "Reset" : "Mark Done"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChecklistDetail
