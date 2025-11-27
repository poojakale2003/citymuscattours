type StatCardProps = {
  title: string;
  value: string;
  trend?: string;
  helper?: string;
  accent?: string;
};

export default function StatCard({
  title,
  value,
  trend,
  helper,
  accent,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42_/_0.6)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        {accent ? (
          <span className="text-lg">{accent}</span>
        ) : (
          <span className="h-3 w-3 rounded-full bg-[var(--color-brand-400)]" />
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      {trend ? (
        <p className="mt-2 text-sm font-semibold text-[var(--color-brand-600)]">
          {trend}
        </p>
      ) : null}
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

