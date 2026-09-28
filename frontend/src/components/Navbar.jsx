import { useAuth } from "../context/AuthContext";

function Navbar() {

  const { user } = useAuth();

  const username = user.username || "User";

  const plan = user.plan || "free";


  return (
    <header className="simple-navbar">

      <div className="simple-navbar-left">

        <div className="simple-mobile-brand">

          <div className="simple-mobile-logo">
            ✦
          </div>

          <strong>
            AIHub
          </strong>

        </div>

      </div>


      <div className="simple-search">

        <span className="simple-search-icon">
          ⌕
        </span>

        <input
          type="text"
          placeholder="Search tools and conversations..."
        />

        <span className="simple-search-shortcut">
          Ctrl K
        </span>

      </div>


      <div className="simple-navbar-right">

        <div className="simple-status">

          <span className="simple-status-dot"></span>

          <span>
            AI Online
          </span>

        </div>


        <button className="simple-navbar-button">
          🔔
        </button>


        <div className="simple-navbar-profile">

          <div className="simple-navbar-avatar">
            {username.charAt(0).toUpperCase()}
          </div>


          <div className="simple-navbar-user">

            <strong>
              {username}
            </strong>

            <span>
              {plan === "pro"
                ? "Pro"
                : "Free"}
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;