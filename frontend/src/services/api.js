const API_URL = "https://aihub-backend-ak1h.onrender.com/api";

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/users/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function loginUser(userData) {
  const response = await fetch(`${API_URL}/users/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function sendAIMessage(prompt, conversationId = null) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/ai/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      conversation_id: conversationId,
    }),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function getConversations() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/conversations/`, {
    method: "GET",
    headers: {
      "Authorization": `Token ${token}`,
    },
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function getMessages(conversationId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/messages/`,
    {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
      },
    }
  );

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function generateText(topic) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/ai/generate-text/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
    body: JSON.stringify({
      topic: topic,
    }),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function summarizeText(text) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/ai/summarize/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function analyzeCode(code) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/ai/code-assistant/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
    body: JSON.stringify({
      code: code,
    }),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function analyzeResume(resume) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/ai/resume-analyzer/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
    body: JSON.stringify({
      resume: resume,
    }),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function getUsage() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/subscriptions/usage/`, {
    method: "GET",
    headers: {
      "Authorization": `Token ${token}`,
    },
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}

export async function getSubscription() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/subscriptions/subscription/`,
    {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
      },
    }
  );

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}
export async function upgradeSubscription() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/subscriptions/upgrade/`,
    {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
      },
    }
  );

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}
export async function getProfile() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/users/profile/`,
    {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
      },
    }
  );

  const data = await response.json();

  return {
    ok: response.ok,
    data: data,
  };
}
export async function deleteConversation(
  conversationId
) {

  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/delete/`,
    {
      method: "DELETE",
      headers: {
        "Authorization": `Token ${token}`,
      },
    }
  );

  let data = {};

  if (response.status !== 204) {
    data = await response.json();
  }

  return {
    ok: response.ok,
    data: data,
  };
}