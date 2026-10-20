import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminUserStats, isAdminEmail } from "@/lib/admin-users";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/payment";

export const dynamic = "force-dynamic";

const dateTimeFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function AdminUsersPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }
  if (!(await hasPaidAccess(user.id))) {
    redirect("/purchase");
  }
  if (!isAdminEmail(user.email)) {
    redirect("/");
  }

  const stats = await getAdminUserStats();
  return (
    <main className="adminUsersPage">
      <header className="adminUsersHeader">
        <div>
          <p className="adminUsersEyebrow">MODELMIND ADMIN</p>
          <h1>User analytics</h1>
          <p className="adminUsersDescription">
            Unique accounts from MongoDB. Today and login times use UTC.
          </p>
        </div>
        <Link className="adminUsersBack" href="/">
          ← Back to ModelMind
        </Link>
      </header>

      <section className="adminUsersStats" aria-label="User statistics">
        <article className="adminUsersCard adminUsersTotal">
          <span>Total registered users</span>
          <strong>{stats.totalUsers.toLocaleString()}</strong>
          <small>Unique accounts, not login sessions</small>
        </article>
        <article className="adminUsersCard adminUsersLatest">
          <span>Most recent login</span>
          {stats.mostRecentLogin ? (
            <>
              <strong>{stats.mostRecentLogin.email}</strong>
              <small>
                {dateTimeFormat.format(stats.mostRecentLogin.loggedInAt)} UTC
              </small>
            </>
          ) : (
            <small>No login activity recorded yet.</small>
          )}
        </article>
      </section>

      <section className="adminUsersList">
        <div className="adminUsersListHeader">
          <div>
            <h2>Registered today</h2>
            <p>New unique accounts created since 00:00 UTC.</p>
          </div>
          <span className="adminUsersCount">
            {stats.registeredToday.length.toLocaleString()}
          </span>
        </div>
        {stats.registeredToday.length ? (
          <div className="adminUsersTableWrap">
            <table className="adminUsersTable">
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col">Registered (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {stats.registeredToday.map((registeredUser) => (
                  <tr key={registeredUser.email.toLowerCase()}>
                    <td>{registeredUser.email}</td>
                    <td>
                      {dateTimeFormat.format(registeredUser.registeredAt)} UTC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="adminUsersEmpty">No new users registered today.</p>
        )}
      </section>
    </main>
  );
}
