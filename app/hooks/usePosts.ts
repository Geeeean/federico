import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/react-query/client";
import { apiFetch } from "@/lib/api";

export const fetchPosts = async () => {
    const response = await apiFetch(`/posts/get/all`);

    const data = await response.json();

    if (response.status != 200) {
        throw new Error("Error on getting posts")
    }
    
    return data.posts;
};

export const usePosts = () => {
    const {
        isLoading,
        error,
        data: posts,
    } = useQuery({
        queryKey: [QUERY_KEY.posts],
        queryFn: fetchPosts
    });

    return { posts, isLoading, error };
};