const publicRoutes = ["/signin", "/signup"];

export default defineNuxtRouteMiddleware(async (to) => {
	if (to.path.startsWith('/api/') || publicRoutes.includes(to.path)) {
		return;
	}

	const { fetchSession, loggedIn } = useAuth();

	await fetchSession();

	if (import.meta.client) {
		if (!loggedIn.value) {
			return navigateTo("/signin");
		}
	}

	if (!loggedIn.value) {
		return navigateTo("/signin");
	}
});