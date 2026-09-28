import { createContext, useContext, useEffect, useState } from "react";
import {
  getProfile,
  getSubscription,
} from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState({
    username: localStorage.getItem("username") || "",
    email: localStorage.getItem("email") || "",
    plan: localStorage.getItem("plan") || "free",
  });

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadUser() {

      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }


      const profileResponse = await getProfile();

      if (profileResponse.ok) {

        const username =
          profileResponse.data.username;

        const email =
          profileResponse.data.email;

        setUser((previous) => ({
          ...previous,
          username: username,
          email: email,
        }));

        localStorage.setItem(
          "username",
          username
        );

        localStorage.setItem(
          "email",
          email
        );
      }


      const subscriptionResponse =
        await getSubscription();

      if (subscriptionResponse.ok) {

        const plan =
          subscriptionResponse.data.plan;

        setUser((previous) => ({
          ...previous,
          plan: plan,
        }));

        localStorage.setItem(
          "plan",
          plan
        );
      }


      setLoading(false);
    }


    loadUser();

  }, []);


  function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("plan");

    setUser({
      username: "",
      email: "",
      plan: "free",
    });
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}