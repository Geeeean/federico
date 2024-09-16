import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";

const toggleModalFetch = async (Modal: { id: number, newViewed: boolean }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modals/toggle`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ modal: Modal }),
        credentials: 'include'
    })

    if (response.status != 200) {
        throw new Error("Error on toggle Modal");
    }

    const data = await response.json();

    return data;
}

export const useToggleModal = () => {
    const client = useQueryClient();

    const { mutate: toggleModal, error, isPending, isSuccess } = useMutation({
        mutationFn: toggleModalFetch,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: [QUERY_KEY.modals] });
        },
    });

    return { toggleModal, error, isPending, isSuccess };
}