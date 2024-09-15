import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";

export const fetchModals = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modals/get/all`);

    const data = await response.json();

    if (response.status != 200) {
        throw new Error("Error on getting modals")
    }

    return data.modals;
};

export const useModals = () => {
    const {
        isLoading,
        error,
        data: modals,
    } = useQuery({
        queryKey: [QUERY_KEY.modals],
        queryFn: fetchModals
    });

    return { modals, isLoading, error };
};