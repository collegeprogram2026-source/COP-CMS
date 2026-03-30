import AdminLayoutClient from "./components/AdminLayoutClient"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }) {
  const clerkUser = await currentUser()

  // Only logged-in users can access /admin
  if (!clerkUser) {
    redirect("/login")
  }

  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  )
}
