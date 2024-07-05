import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, Session } from "next-auth"
import bcrypt from  "bcryptjs"
import userModel from "@/model/User"
import dbConnect from "@/lib/dbConnect";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any) : Promise<any> {
                await dbConnect();
                try {
                    const user = await userModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { password: credentials.identifier }
                        ]
                    });

                    if (!user) {
                        throw new Error("user not found with this email and username");
                    }

                    if (!user.isVerified) {
                        throw new Error("please verify your account before login");
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error("incorrect password");
                    }

                } catch (err: any) {
                    throw new Error(err);
                }
            }
        })
    ],
    callbacks: {
        async jwt({token, user}){
            if (user) {
                token._id = user._id?.toString();
                token.isverified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token;
        },
        async session({session, token}: {session : Session, token: any}) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
        },
    },
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}