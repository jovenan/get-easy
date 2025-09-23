import { auth } from "../../services/auth";

export default defineEventHandler((event) => {
    return auth.handler(toWebRequest(event));
});

