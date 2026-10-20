import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";
import { apiFetch } from "@/lib/api";

const removeModalFetch = async (Modal: { id: number }) => {
    const response = await apiFetch(`/modals/remove`, {
        method: "POST",
        body: JSON.stringify({ modal: Modal }),
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