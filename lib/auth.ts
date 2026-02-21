import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const validUser = process.env.ADMIN_USERNAME ?? "admin";
                const validPass = process.env.ADMIN_PASSWORD ?? "admin123";

                if (
                    credentials?.username === validUser &&
                    credentials?.password === validPass
                ) {
                    return { id: "1", name: "Admin", email: "admin@hashturn.com" };
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/admin/login",
    },
    session: { strategy: "jwt" },
});
