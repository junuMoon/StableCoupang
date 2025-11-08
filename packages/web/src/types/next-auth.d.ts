import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      xrpAddress: string
    } & DefaultSession["user"]
  }

  interface User {
    xrpAddress: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    xrpAddress: string
  }
}
