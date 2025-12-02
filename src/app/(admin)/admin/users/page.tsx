const users = [
  {
    name: "Amelia Carter",
    email: "amelia@wanderlust.co",
    bookings: 6,
    status: "VIP",
  },
  {
    name: "Rahul Verma",
    email: "rahul@vermagroup.com",
    bookings: 3,
    status: "Corporate",
  },
  {
    name: "Sofia Mendes",
    email: "sofia@atelier.studio",
    bookings: 4,
    status: "VIP",
  },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-600">
            Manage traveler profiles, loyalty tiers, and concierge assignments.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
        >
          Add new user
        </button>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_25px_70px_-45px_rgb(15_23_42_/_0.6)] sm:p-6">
        <div className="overflow-x-auto -mx-4 sm:mx-0 sm:rounded-2xl" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
          <div className="min-w-[640px] rounded-2xl border border-slate-200 sm:min-w-full">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 sm:px-6">
                    Traveler
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 sm:px-6 hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 sm:px-6">
                    Bookings
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 sm:px-6 hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-50/60">
                    <td className="px-3 py-4 font-medium text-slate-900 sm:px-6">
                      <div className="max-w-[200px] truncate sm:max-w-none" title={user.name}>
                        {user.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 md:hidden">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-slate-600 sm:px-6 hidden md:table-cell">
                      <div className="max-w-[200px] truncate" title={user.email}>
                        {user.email}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-slate-600 sm:px-6">{user.bookings}</td>
                    <td className="px-3 py-4 sm:px-6 hidden sm:table-cell">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right sm:px-6">
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:px-4"
                      >
                        View profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

