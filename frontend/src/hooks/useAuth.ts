import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const loading = useAuthStore((state) => state.loading);
  const initialize = useAuthStore((state) => state.initialize);
  const signIn = useAuthStore((state) => state.signIn);
  const register = useAuthStore((state) => state.register);
  const signOut = useAuthStore((state) => state.signOut);

  return { user, token, loading, initialize, signIn, register, signOut };
}
