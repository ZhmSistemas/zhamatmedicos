import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.log("Dashboard layout session:", session);

  // Si no hay sesión o el usuario NO es admin, redirigir
  if (!session || !session.user?.isAdmin) {
    console.log("No session or not admin, redirecting");
    redirect("/"); // Puedes cambiar a "/auth/login" o donde gustes
  }

  // Si es admin, mostramos el contenido del dashboard
  return <>{children}</>;
}
