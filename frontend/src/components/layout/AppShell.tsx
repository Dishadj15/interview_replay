import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/upload", label: "Upload" },
  { to: "/history", label: "History" },
  { to: "/analytics", label: "Analytics" },
  { to: "/progress", label: "Progress" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Interview Replay</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Practice smarter</h1>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function TopBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
      <div className="lg:hidden">
        <p className="text-sm font-semibold text-brand-700">Interview Replay</p>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-slate-600 sm:inline">{user?.email}</span>
        <Button variant="secondary" onClick={signOut}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 lg:px-8">
            <Outlet />
          </main>
          <nav className="sticky bottom-0 flex border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
