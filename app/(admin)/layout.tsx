import "@/app/globals.css";
import AdminNav from "@/components/AdminNav";
import AdminWrapper from "@/components/AdminWrapper";
import { queryClient } from "@/react-query/client";

import { QueryClientProvider } from "@tanstack/react-query";

export const metadata = {
  title: 'Admin',
  description: "Federico's landing page admin panel",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="w-screen h-screen grid grid-rows-[auto,1fr]">
        <AdminWrapper>
          <AdminNav />
          {children}
        </AdminWrapper>
      </body>
    </html>
  )
}
