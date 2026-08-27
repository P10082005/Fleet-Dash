import "../App.css";
function Dashboard() {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2> Fleet_Dash</h2>
        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Vehicles</a>
          <a href="#">Drivers</a>
          <a href="#">Maintenance</a>
          <a href="#">Reports</a>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="main-content">
        <h1>Fleet Dashboard</h1>
        <p> Manage yuor fleet in one place.</p>

        <div className="cards">
          <div className="card">
             <h3>total Vehicals</h3>
             <p>25</p>
          </div>
          <div className="card">
             <h3>Active Vehicals</h3>
             <p>18</p>
          </div>
          <div className="card">
            <h3>Maintenance</h3>
            <p>4</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;