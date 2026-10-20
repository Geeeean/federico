import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";
import { apiFetch } from "@/lib/api";

const postPost = async (Post: { title: string, description: string, link: string | null }) => {
    const response = await apiFetch(`/posts/add`, {
        method: "POST",
        body: JSON.stringify({ post: Post }),
    })
    
    if (response.status != 200) {
        throw new Error("Error on adding post");
    }

    const data = await response.json();


    return data;
}

export const useAddPost = () => {
    const client = useQueryClient();

    const { mutate: addPost, error, isPending, isSuccess } = useMutation({
        mutationFn: postPost,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: [QUERY_KEY.posts] });
        },
    });

    return { addPost, error, isPending, isSuccess };
}