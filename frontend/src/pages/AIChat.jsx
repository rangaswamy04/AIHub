import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  sendAIMessage,
  getConversations,
  getMessages,
  deleteConversation,
} from "../services/api";

import { useNavigate } from "react-router-dom";


function AIChat() {

  const navigate = useNavigate();

  const messagesEndRef = useRef(null);


  /* ================================
     STATE
  ================================= */

  const [prompt, setPrompt] = useState("");

  const [messages, setMessages] = useState([]);

  const [conversations, setConversations] =
    useState([]);

  const [currentConversation, setCurrentConversation] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [error, setError] =
    useState("");

  const [limitReached, setLimitReached] =
    useState(false);


  /* ================================
     CONVERSATION TITLE
  ================================= */

  function getConversationTitle(title) {

    if (!title) {
      return "New conversation";
    }

    if (title.length <= 32) {
      return title;
    }

    return `${title.substring(0, 32)}...`;
  }


  /* ================================
     LOAD CONVERSATIONS
  ================================= */

  useEffect(() => {

    loadConversations();

  }, []);


  async function loadConversations() {

    setLoadingHistory(true);

    const response =
      await getConversations();


    if (response.ok) {

      setConversations(
        response.data
      );

    }


    setLoadingHistory(false);
  }


  /* ================================
     AUTO SCROLL
  ================================= */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages, loading]);


  /* ================================
     OPEN CONVERSATION
  ================================= */

  async function openConversation(
    conversationId
  ) {

    setError("");

    setLoadingHistory(true);


    const response =
      await getMessages(
        conversationId
      );


    if (response.ok) {

      setMessages(
        response.data
      );

      setCurrentConversation(
        conversationId
      );

      setLimitReached(false);

    } else {

      setError(
        "Unable to load this conversation."
      );

    }


    setLoadingHistory(false);
  }


  /* ================================
     NEW CHAT
  ================================= */

  function startNewChat() {

    setMessages([]);

    setCurrentConversation(null);

    setPrompt("");

    setError("");

    setLimitReached(false);
  }


  /* ================================
     DELETE CONVERSATION
  ================================= */

  async function handleDeleteConversation(
    conversationId
  ) {

    setError("");


    const response =
      await deleteConversation(
        conversationId
      );


    if (!response.ok) {

      setError(
        "Unable to delete conversation."
      );

      return;
    }


    setConversations((previous) =>
      previous.filter(
        (conversation) =>
          conversation.id !== conversationId
      )
    );


    if (
      currentConversation ===
      conversationId
    ) {

      setMessages([]);

      setCurrentConversation(null);

      setPrompt("");

    }

  }


  /* ================================
     SEND MESSAGE
  ================================= */

  async function handleSend(event) {

    event.preventDefault();


    if (!prompt.trim()) {
      return;
    }


    setError("");

    setLimitReached(false);


    const currentPrompt =
      prompt.trim();


    const userMessage = {

      role: "user",

      content: currentPrompt,

    };


    setMessages((previous) => [

      ...previous,

      userMessage,

    ]);


    setPrompt("");

    setLoading(true);


    try {
      const response = await sendAIMessage(
        currentPrompt,
        currentConversation
      );

      if (response.ok) {
        setCurrentConversation(response.data.conversation_id);
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            content: response.data.response,
          },
        ]);

        loadConversations();
      } else if (
        response.data.error?.toLowerCase().includes("limit")
      ) {
        setLimitReached(true);
        setMessages((previous) =>
          previous.filter((message) => message !== userMessage)
        );
      } else {
        setError(
          response.data.error || "Unable to get an AI response."
        );
      }
    } catch (requestError) {
      setError(
        requestError?.message || "Unable to get an AI response."
      );
    } finally {
      setLoading(false);
    }
  }


  /* ================================
     ENTER KEY
  ================================= */

  function handleKeyDown(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend(event);

    }

  }


  /* ================================
     UI
  ================================= */

  return (

    <div className="simple-chat-page">


      {/* HEADER */}

      <div className="simple-chat-header">

        <div>

          <h1>
            AI Chat
          </h1>

          <p>
            Ask questions, brainstorm ideas,
            or get help from AI.
          </p>

        </div>


        <button
          className="simple-new-chat-button"
          onClick={startNewChat}
        >
          + New Chat
        </button>

      </div>


      {/* LIMIT BANNER */}

      {limitReached && (

        <div className="simple-limit-banner">

          <div>

            <strong>
              Free AI requests used
            </strong>

            <p>
              You've reached the free usage
              limit. Upgrade to Pro for more
              AI requests.
            </p>

          </div>


          <button
            onClick={() =>
              navigate("/pricing")
            }
          >
            View Plans
          </button>

        </div>

      )}


      {/* CHAT LAYOUT */}

      <div className="simple-chat-layout">


        {/* CONVERSATION HISTORY */}

        <aside className="simple-chat-history">

          <div className="simple-history-title">
            Conversations
          </div>


          {loadingHistory ? (

            <div className="simple-history-empty">
              Loading...
            </div>

          ) : conversations.length === 0 ? (

            <div className="simple-history-empty">
              No conversations yet.
            </div>

          ) : (

            conversations.map(
              (conversation) => (

                <div
                  key={conversation.id}
                  className={`simple-conversation-row ${
                    currentConversation ===
                    conversation.id
                      ? "active"
                      : ""
                  }`}
                >

                  <button
                    className="simple-conversation-item"
                    onClick={() =>
                      openConversation(
                        conversation.id
                      )
                    }
                  >

                    <span>
                      ◫
                    </span>

                    <span>
                      {getConversationTitle(
                        conversation.title
                      )}
                    </span>

                  </button>


                  <button
                    className="simple-delete-conversation"
                    onClick={() =>
                      handleDeleteConversation(
                        conversation.id
                      )
                    }
                    title="Delete conversation"
                  >
                    ×
                  </button>

                </div>

              )
            )

          )}

        </aside>


        {/* CHAT CARD */}

        <section className="simple-chat-card">


          {/* MESSAGES */}

          <div className="simple-chat-messages">


            {messages.length === 0 && (

              <div className="simple-chat-empty">

                <div className="simple-chat-empty-icon">
                  ✦
                </div>

                <h2>
                  How can I help you?
                </h2>

                <p>
                  Ask anything and start a
                  conversation with AI.
                </p>

              </div>

            )}


            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={`simple-message ${
                    message.role === "user"
                      ? "user"
                      : "assistant"
                  }`}
                >

                  <div className="simple-message-avatar">

                    {message.role === "user"
                      ? "U"
                      : "✦"}

                  </div>


                  <div className="simple-message-content">

                    {message.content}

                  </div>

                </div>

              )
            )}


            {/* AI THINKING */}

            {loading && (

              <div className="simple-message assistant">

                <div className="simple-message-avatar">
                  ✦
                </div>

                <div className="simple-typing">

                  AI is thinking...

                </div>

              </div>

            )}


            {/* AUTO SCROLL */}

            <div ref={messagesEndRef} />

          </div>


          {/* ERROR */}

          {error && (

            <div className="simple-chat-error">

              {error}

            </div>

          )}


          {/* INPUT */}

          <form
            className="simple-chat-input-area"
            onSubmit={handleSend}
          >

            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={
                limitReached
                  ? "Upgrade to continue using AI..."
                  : "Message AIHub..."
              }
              rows="2"
              disabled={
                loading ||
                limitReached
              }
            />


            <button
              type="submit"
              disabled={
                loading ||
                limitReached ||
                !prompt.trim()
              }
            >

              {loading
                ? "..."
                : "↑"}

            </button>

          </form>


          {/* DISCLAIMER */}

          <div className="simple-chat-disclaimer">

            AIHub can make mistakes.
            Check important information.

          </div>


        </section>

      </div>

    </div>

  );
}


export default AIChat;
