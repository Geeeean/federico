"use client"

import { queryClient } from "@/react-query/client"
import { QueryClientProvider } from "@tanstack/react-query"

export const AdminWrapper = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

export default AdminWrapper