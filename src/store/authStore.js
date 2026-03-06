import { create } from "zustand";

export const useAuthStore = create((set) => ({

  user: null,
  loading: false,

  login: async (username, password) => {

    set({ loading: true });

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    set({ loading: false });

    if (data.success) {
      set({ user: username });
      window.location.href = "/dashboard";
    } else {
      alert(data.error);
    }

  },

    logout: async () => {
        await fetch("/api/logout");
        window.location.href = "/";
    }

}));