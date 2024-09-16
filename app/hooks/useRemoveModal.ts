import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";

const removeModalFetch = async (Modal: { id: number }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modals/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ modal: Modal }),
        credentials: 'include'
    })

    if (response.status != 200) {
        throw new Error("Error on removing Modal");
    }

    const data = await response.json();

    return data;
}

export const useRemoveModal = () => {
    const client = useQueryClient();

    const { mutate: removeModal, error, isPending, isSuccess } = useMutation({
        mutationFn: removeModalFetch,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: [QUERY_KEY.modals] });
        },
    });

    return { removeModal, error, isPending, isSuccess };
}