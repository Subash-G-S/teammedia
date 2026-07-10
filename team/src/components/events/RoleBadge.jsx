function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
      {role || "Media"}
    </span>
  )
}

export default RoleBadge
