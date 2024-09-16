import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";

const removePostFetch = async (Post: { id: number }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ post: Post }),
        credentials: 'include'
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