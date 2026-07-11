import { useEffect, useMemo, useState } from "react"
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore"
import { ClipboardCheck, Plus, Search, Trash2, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { db } from "../services/firebase"

const getCompletedCount = (items, checklistId) =>
  items.filter(item => item.checklistId === checklistId && item.completed).length

function Checklists() {
  const [title, setTitle] = useState("")
  const [search, setSearch] = useState("")
  const [checklists, setChecklists] = useState([])
  const [items, setItems] = useState([])
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const fetchChecklists = async () => {
    setLoading(true)

    const [checklistsSnap, itemsSnap, membersSnap] = await Promise.all([
      getDocs(collection(db, "checklists")),
      getDocs(collection(db, "checklistItems")),
      getDocs(collection(db, "members"))
    ])

    setChecklists(
      checklistsSnap.docs
        .map(item => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    )
    setItems(itemsSnap.docs.map(item => ({ id: item.id, ...item.data() })))
    setMemberCount(membersSnap.size)
    setLoading(false)
  }

  useEffect(() => {
    fetchChecklists()
  }, [])

  const createChecklist = async () => {
    const cleanTitle = title.trim()
    if (!cleanTitle || saving) return

    setSaving(true)
    const created = await addDoc(collection(db, "checklists"), {
      title: cleanTitle,
      createdAt: Date.now()
    })

    setTitle("")
    setSaving(false)
    navigate(`/checklists/${created.id}`)
  }

  const removeChecklist = async (event, checklist) => {
    event.stopPropagation()

    const confirmed = window.confirm(`Delete "${checklist.title}"? Existing checklist marks will also be cleared from the view.`)
    if (!confirmed) return

    await deleteDoc(doc(db, "checklists", checklist.id))
    fetchChecklists()
  }

  const visibleChecklists = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return checklists

    return checklists.filter(list => list.title?.toLowerCase().includes(query))
  }, [checklists, search])

  const totalCompleted = checklists.reduce((sum, list) => sum + getCompletedCount(items, list.id), 0)
  const totalPossible = checklists.length * memberCount
  const overallProgress = totalPossible ? Math.round((totalCompleted / totalPossible) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Checklists</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50">
            Track member-wise submissions, permissions, collections, attendance, and other repeatable team follow-ups.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
            <p className="text-xl font-bold text-white">{checklists.length}</p>
            <p className="text-xs text-white/45">Lists</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
            <p className="text-xl font-bold text-white">{memberCount}</p>
            <p className="text-xs text-white/45">Members</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
            <p className="text-xl font-bold text-white">{overallProgress}%</p>
            <p className="text-xs text-white/45">Overall</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && createChecklist()}
            placeholder="New checklist name, e.g. ID card collection"
            className="rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-white/35"
          />

          <button
            onClick={createChecklist}
            disabled={saving || !title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus size={18} />
            Create
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:max-w-sm lg:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search checklists"
            className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35"
          />
        </div>
        <p className="text-sm text-white/45">
          {visibleChecklists.length} checklist{visibleChecklists.length !== 1 && "s"} shown
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white/55">
          Loading checklists...
        </div>
      ) : visibleChecklists.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white/55">
          No checklist matches this search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleChecklists.map(list => {
            const completed = getCompletedCount(items, list.id)
            const pending = Math.max(memberCount - completed, 0)
            const progress = memberCount ? Math.round((completed / memberCount) * 100) : 0

            return (
              <div
                key={list.id}
                onClick={() => navigate(`/checklists/${list.id}`)}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-5 text-left shadow-xl backdrop-blur-xl transition hover:bg-white/15"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => event.key === "Enter" && navigate(`/checklists/${list.id}`)}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-100">
                      <ClipboardCheck size={22} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-white">{list.title}</h2>
                      <p className="mt-1 text-sm text-white/50">{completed} completed, {pending} pending</p>
                    </div>
                  </div>

                  <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-sm font-semibold text-white/75">
                    {progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-black/15 p-3">
                    <p className="text-lg font-bold text-white">{completed}</p>
                    <p className="text-xs text-white/45">Done</p>
                  </div>
                  <div className="rounded-2xl bg-black/15 p-3">
                    <p className="text-lg font-bold text-white">{pending}</p>
                    <p className="text-xs text-white/45">Need follow-up</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="inline-flex items-center gap-2 text-sm text-white/50">
                    <Users size={16} />
                    {memberCount} member{memberCount !== 1 && "s"}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => removeChecklist(event, list)}
                    onKeyDown={(event) => event.key === "Enter" && removeChecklist(event, list)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                  >
                    <Trash2 size={16} />
                    Delete
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Checklists
