import type { Session } from "better-auth";
import { client } from "~/lib/auth";

export const useAuth = () => {
    const headers = import.meta.server ? useRequestHeaders() : undefined
    const session = useState<Session | null>('auth:session', () => null)

    const signInWithEmail = async ({ email, password }: { email: string, password: string}) => {
        const session = await client.signIn.email({
            email,
            password,
        });
        return session;
    }
    
    const signUpWithEmail = async ({ name, email, password }: { name: string, email: string, password: string}) => {
        const session = await client.signUp.email({
            name,
            email,
            password,
        });
        return session;
    }

    const logout = async () => {
        const session = await client.signOut();
        navigateTo("/signin");
        return session;
    }

    const fetchSession = async () => {
        const result = await client.getSession({
            fetchOptions: {
                headers
          },
        });
        session.value = result.data?.session ?? null;
        return session;
    }

    if (import.meta.client) {
        client.$store.listen('$sessionSignal', async (signal) => {
          if (!signal)
            return
          await fetchSession()
        })
      }
    
    return { session, signInWithEmail, signUpWithEmail, logout, fetchSession, loggedIn: computed(() => !!session.value) };
}