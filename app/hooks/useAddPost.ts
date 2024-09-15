import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";

const postNews = async (Post: { title: string, description: string, link: string | null }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ post: Post }),
        credentials: 'include'
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
        mutationFn: postNews,
        onSuccess: () => {
            client.invalidateQueries({ queryKey: [QUERY_KEY.posts] });
        },
    });

    return { addPost, error, isPending, isSuccess };
}