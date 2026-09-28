import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  getUsage,
  getConversations,
} from "../services/api";

import { useAuth } from "../context/AuthContext";


function Dashboard() {

  const { user } = useAuth();


  const [usage, setUsage] = useState({
    requests_used: 0,
    credits_used: 0,
  });


  const [conversationCount, setConversationCount] =
    useState(0);


  const [loading, setLoading] =
    useState(true);


  /* ================================
     PLAN LIMITS
  ================================= */

  const plan =
    user.plan || "free";


  const requestLimit =
    plan === "pro"
      ? 100
      : 10;


  /* ================================
     LOAD DASHBOARD DATA
  ================================= */

  useEffect(() => {

    async function loadDashboardData() {

      setLoading(true);


      const [
        usageResponse,
        conversationsResponse,
      ] = await Promise.all([
        getUsage(),
        getConversations(),
      ]);


      if (usageResponse.ok) {

        setUsage(
          usageResponse.data
        );

      }


      if (conversationsResponse.ok) {

        setConversationCount(
          conversationsResponse.data.length
        );

      }


      setLoading(false);
    }


    loadDashboardData();

  }, []);


  /* ================================
     USER INFORMATION
  ================================= */

  const username =
    user.username || "User";


  /* ================================
     USAGE CALCULATIONS
  ================================= */

  const requestsUsed =
    usage.requests_used || 0;


  const remainingRequests =
    Math.max(
      requestLimit - requestsUsed,
      0
    );


  const usagePercentage =
    Math.min(
      (requestsUsed / requestLimit) * 100,
      100
    );


  return (

    <div className="simple-dashboard">


      {/* ================================
          HEADER
      ================================= */}

      <div className="simple-dashboard-header">

        <div>

          <h1>
            Welcome back, {username} 👋
          </h1>

          <p>
            Manage your AI tools and productivity
            from one place.
          </p>

        </div>

      </div>


      {/* ================================
          STATS
      ================================= */}

      <div className="simple-stats-grid">


        {/* AI REQUESTS */}

        <div className="simple-stat-card">

          <div className="simple-stat-icon">
            ✦
          </div>

          <div>

            <span>
              AI Requests
            </span>

            <strong>
              {loading
                ? "..."
                : requestsUsed}
            </strong>

          </div>

        </div>


        {/* CONVERSATIONS */}

        <div className="simple-stat-card">

          <div className="simple-stat-icon">
            ◫
          </div>

          <div>

            <span>
              Conversations
            </span>

            <strong>
              {loading
                ? "..."
                : conversationCount}
            </strong>

          </div>

        </div>


        {/* CREDITS */}

        <div className="simple-stat-card">

          <div className="simple-stat-icon">
            ◉
          </div>

          <div>

            <span>
              Credits Used
            </span>

            <strong>
              {loading
                ? "..."
                : usage.credits_used}
            </strong>

          </div>

        </div>


        {/* PLAN */}

        <div className="simple-stat-card">

          <div className="simple-stat-icon">
            ★
          </div>

          <div>

            <span>
              Current Plan
            </span>

            <strong>

              {loading
                ? "..."
                : plan.charAt(0).toUpperCase() +
                  plan.slice(1)}

            </strong>

          </div>

        </div>


      </div>


      {/* ================================
          USAGE CARD
      ================================= */}

      <div className="simple-usage-card">


        <div className="simple-usage-header">

          <div>

            <h2>
              AI Usage
            </h2>


            <p>

              {plan === "pro"

                ? `${remainingRequests} Pro AI requests remaining.`

                : `${remainingRequests} free AI requests remaining.`}

            </p>

          </div>


          <strong>

            {loading
              ? "..."
              : `${requestsUsed} / ${requestLimit}`}

          </strong>

        </div>


        {/* PROGRESS BAR */}

        <div className="simple-usage-bar">

          <div
            className="simple-usage-progress"
            style={{
              width:
                `${usagePercentage}%`,
            }}
          ></div>

        </div>


        {/* FREE LIMIT REACHED */}

        {plan === "free" &&
          remainingRequests === 0 && (

            <div className="simple-usage-warning">

              <span>
                You've reached your free AI
                request limit.
              </span>


              <NavLink to="/pricing">
                Upgrade to Pro →
              </NavLink>

            </div>

          )}


        {/* PRO LIMIT REACHED */}

        {plan === "pro" &&
          remainingRequests === 0 && (

            <div className="simple-usage-warning">

              <span>
                You've reached your Pro AI
                request limit.
              </span>

            </div>

          )}


      </div>


      {/* ================================
          AI TOOLS
      ================================= */}

      <div className="simple-section-header">

        <div>

          <h2>
            AI Tools
          </h2>

          <p>
            Choose a tool to get started.
          </p>

        </div>

      </div>


      <div className="simple-tools-grid">


        {/* AI CHAT */}

        <NavLink
          to="/chat"
          className="simple-tool-card"
        >

          <div className="simple-tool-icon">
            ✦
          </div>

          <h3>
            AI Chat
          </h3>

          <p>
            Ask questions and have conversations
            with AI.
          </p>

          <span className="simple-tool-link">
            Open tool →
          </span>

        </NavLink>


        {/* TEXT GENERATOR */}

        <NavLink
          to="/text-generator"
          className="simple-tool-card"
        >

          <div className="simple-tool-icon">
            ✎
          </div>

          <h3>
            Text Generator
          </h3>

          <p>
            Generate useful content from a
            simple topic.
          </p>

          <span className="simple-tool-link">
            Open tool →
          </span>

        </NavLink>


        {/* SUMMARIZER */}

        <NavLink
          to="/summarizer"
          className="simple-tool-card"
        >

          <div className="simple-tool-icon">
            ≡
          </div>

          <h3>
            Summarizer
          </h3>

          <p>
            Turn long text into clear and
            concise summaries.
          </p>

          <span className="simple-tool-link">
            Open tool →
          </span>

        </NavLink>


        {/* CODE ASSISTANT */}

        <NavLink
          to="/code-assistant"
          className="simple-tool-card"
        >

          <div className="simple-tool-icon">
            &lt;/&gt;
          </div>

          <h3>
            Code Assistant
          </h3>

          <p>
            Analyze code and get useful
            programming suggestions.
          </p>

          <span className="simple-tool-link">
            Open tool →
          </span>

        </NavLink>


        {/* RESUME ANALYZER */}

        <NavLink
          to="/resume-analyzer"
          className="simple-tool-card"
        >

          <div className="simple-tool-icon">
            ◫
          </div>

          <h3>
            Resume Analyzer
          </h3>

          <p>
            Analyze your resume and improve
            its content.
          </p>

          <span className="simple-tool-link">
            Open tool →
          </span>

        </NavLink>


      </div>


      {/* ================================
          GETTING STARTED
      ================================= */}

      <div className="simple-getting-started">

        <div>

          <div className="simple-getting-icon">
            ✨
          </div>

          <div>

            <h3>
              Get started with AIHub
            </h3>

            <p>
              Choose any AI tool from the
              dashboard or sidebar and start
              exploring.
            </p>

          </div>

        </div>


        <NavLink
          to="/chat"
          className="simple-primary-button"
        >
          Start chatting
        </NavLink>

      </div>


    </div>

  );
}


export default Dashboard;