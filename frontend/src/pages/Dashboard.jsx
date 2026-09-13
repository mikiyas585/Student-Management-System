import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const linksByRole = {
    admin: ["Manage students", "Publish notices", "Open subscriptions", "View all payments"],
    teacher: ["View/edit students", "Publish notices", "Record attendance"],
    student: ["View my record", "Read notices", "Subscribe & pay", "View my attendance"],
    parent: ["View my child's record", "Read notices", "View my child's attendance"],
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome, {user.name}</h2>
        <p>Role: <span className="badge">{user.role}</span></p>
        <p>Use the navigation bar above to get around. Here's what you can do:</p>
        <ul>
          {linksByRole[user.role]?.map(function (item) {
            return <li key={item}>{item}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
