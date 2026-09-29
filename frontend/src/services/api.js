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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(`${API_URL}/ai/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({
        prompt,
        conversation_id: conversationId,
      }),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {
        error: `The AI service returned an unreadable response (HTTP ${response.status}).`,
      };
    }

    if (!data || typeof data !== "object") {
      data = {
        error: `The AI service returned an invalid response (HTTP ${response.status}).`,
      };
    }

    if (!response.ok && !data.error) {
      data.error = data.detail || `AI request failed (HTTP ${response.status}).`;
    }

    return {
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      data: {
        error: error.name === "AbortError"
          ? "The AI request timed out. Please try again."
          : "Unable to reach the AI service. Please check your connection and try again.",
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function postAITool(endpoint, payload) {
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(`${API_URL}/ai/${endpoint}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {
        error: `The AI service returned an unreadable response (HTTP ${response.status}).`,
      };
    }

    if (!data || typeof data !== "object") {
      data = {
        error: `The AI service returned an invalid response (HTTP ${response.status}).`,
      };
    }

    if (!response.ok && !data.error) {
      data.error = data.detail || `AI request failed (HTTP ${response.status}).`;
    }

    return { ok: response.ok, data };
  } catch (error) {
    return {
      ok: false,
      data: {
        error: error.name === "AbortError"
          ? "The AI request timed out. Please try again."
          : "Unable to reach the AI service. Please check your connection and try again.",
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
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
  return postAITool("generate-text", { topic });
}

export async function summarizeText(text) {
  return postAITool("summarize", { text });
}

export async function analyzeCode(code) {
  return postAITool("code-assistant", { code });
}

export async function analyzeResume(resume) {
  return postAITool("resume-analyzer", { resume });
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
