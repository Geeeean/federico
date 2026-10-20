import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";
import { apiFetch } from "@/lib/api";

const removePostFetch = async (Post: { id: number }) => {
    const response = await apiFetch(`/posts/remove`, {
        method: "POST",
        body: JSON.stringify({ post: Post }),
    })

    if (response.status != 200) {
        throw new Error("Error on removing post");
    }

    const data = await response.json();

    return data;
}

export const useRemovePost = () => {
    const client = useQueryClient();

    const { mutate: removePost, error, isPending, isSuccess } = useMutation({
        mutationFn: removePostFetch,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: [QUERY_KEY.posts] });
        },
    });

    return { removePost, error, isPending, isSuccess };
}