import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { upgradeSubscription } from "../services/api";

import { useAuth } from "../context/AuthContext";


function Sidebar() {

  const navigate = useNavigate();


  const {
    user,
    setUser,
    logout,
  } = useAuth();


  const [showMenu, setShowMenu] =
    useState(false);


  const [upgrading, setUpgrading] =
    useState(false);


  const username =
    user.username || "User";


  const plan =
    user.plan || "free";


  /* ================================
     NAVIGATION CLASS
  ================================= */

  const navClass = ({ isActive }) =>
    `simple-nav-link ${
      isActive ? "active" : ""
    }`;


  /* ================================
     UPGRADE
  ================================= */

  async function handleUpgrade() {

    setUpgrading(true);


    const response =
      await upgradeSubscription();


    if (response.ok) {

      const newPlan =
        response.data.plan;


      setUser((previous) => ({

        ...previous,

        plan: newPlan,

      }));


      localStorage.setItem(
        "plan",
        newPlan
      );

    }


    setUpgrading(false);
  }


  /* ================================
     LOGOUT
  ================================= */

  function handleLogout() {

    logout();

    navigate("/login");

  }


  return (

    <aside className="simple-sidebar">


      {/* ================================
          BRAND
      ================================= */}

      <div className="simple-brand">

        <div className="simple-logo">
          ✦
        </div>

        <div className="simple-brand-text">

          <strong>
            AIHub
          </strong>

          <span>
            AI Productivity
          </span>

        </div>

      </div>


      {/* ================================
          NAVIGATION
      ================================= */}

      <nav className="simple-sidebar-nav">


        <div className="simple-nav-heading">
          WORKSPACE
        </div>


        <NavLink
          to="/"
          className={navClass}
        >

          <span className="simple-nav-icon">
            ⌂
          </span>

          <span>
            Dashboard
          </span>

        </NavLink>


        <NavLink
          to="/chat"
          className={navClass}
        >

          <span className="simple-nav-icon">
            ✦
          </span>

          <span>
            AI Chat
          </span>

        </NavLink>


        <div className="simple-nav-heading tools-heading">
          AI TOOLS
        </div>


        <NavLink
          to="/text-generator"
          className={navClass}
        >

          <span className="simple-nav-icon">
            ✎
          </span>

          <span>
            Text Generator
          </span>

        </NavLink>


        <NavLink
          to="/summarizer"
          className={navClass}
        >

          <span className="simple-nav-icon">
            ≡
          </span>

          <span>
            Summarizer
          </span>

        </NavLink>


        <NavLink
          to="/code-assistant"
          className={navClass}
        >

          <span className="simple-nav-icon">
            &lt;/&gt;
          </span>

          <span>
            Code Assistant
          </span>

        </NavLink>


        <NavLink
          to="/resume-analyzer"
          className={navClass}
        >

          <span className="simple-nav-icon">
            ◫
          </span>

          <span>
            Resume Analyzer
          </span>

        </NavLink>


        <NavLink
          to="/pricing"
          className={navClass}
        >

          <span className="simple-nav-icon">
            $
          </span>

          <span>
            Pricing
          </span>

        </NavLink>


      </nav>


      {/* ================================
          EMPTY SPACE
      ================================= */}

      <div className="simple-sidebar-spacer"></div>


      {/* ================================
          FREE PLAN
      ================================= */}

      {plan === "free" && (

        <div className="simple-pro-card">


          <div className="simple-pro-icon">
            ✨
          </div>


          <div className="simple-pro-title">
            Free Plan
          </div>


          <div className="simple-pro-text">
            You have 10 AI requests.
            Upgrade to Pro for 100 requests.
          </div>


          <button
            className="simple-pro-button"
            onClick={handleUpgrade}
            disabled={upgrading}
          >

            {upgrading
              ? "Upgrading..."
              : "Upgrade to Pro"}

          </button>


        </div>

      )}


      {/* ================================
          PRO PLAN
      ================================= */}

      {plan === "pro" && (

        <div className="simple-pro-card">


          <div className="simple-pro-icon">
            ✓
          </div>


          <div className="simple-pro-title">
            Pro Plan
          </div>


          <div className="simple-pro-text">
            You have access to 100 AI
            requests and all AIHub tools.
          </div>


          <button
            className="simple-pro-button"
            onClick={() =>
              navigate("/pricing")
            }
          >
            View Plan
          </button>


        </div>

      )}


      {/* ================================
          USER SECTION
      ================================= */}

      <div className="simple-sidebar-user">


        <div className="simple-user-avatar">
          {username
            .charAt(0)
            .toUpperCase()}
        </div>


        <div className="simple-user-info">

          <strong>
            {username}
          </strong>

          <span>

            {plan === "pro"
              ? "Pro plan"
              : "Free plan"}

          </span>

        </div>


        <button
          className="simple-user-menu"
          onClick={() =>
            setShowMenu(!showMenu)
          }
        >
          ⋮
        </button>


        {/* USER DROPDOWN */}

        {showMenu && (

          <div className="simple-user-dropdown">

            <button
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        )}


      </div>


    </aside>

  );
}


export default Sidebar;