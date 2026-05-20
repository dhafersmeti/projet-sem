export default function KPICard({ title, value, sub, icon: Icon, gradient = 'from-indigo-500 to-indigo-700' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md bg-gradient-to-br ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-white/70 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
    </div>
  )
}
