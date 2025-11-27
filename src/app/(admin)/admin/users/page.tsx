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

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42_/_0.6)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Traveler
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-slate-600">{user.bookings}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      View profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

