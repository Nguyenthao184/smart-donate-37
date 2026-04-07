import { create } from "zustand";
import {
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  getPostMatches,
} from "../api/postService";

let currentPage = 1;
let currentKey = "";
const detailPromises = {};

const usePostStore = create((set, get) => ({
  posts: [],
  postDetail: {},
  matches: {},
  loadingMatches: false,
  loading: false,
  hasMore: true,

  fetchPosts: async (params = {}, loadMore = false) => {
    const key = JSON.stringify(params);

    if (!loadMore && currentKey !== key) {
      currentPage = 1;
      set({ posts: [], hasMore: true });
    }

    const page = loadMore ? currentPage + 1 : 1;

    if (get().loading) return;

    set({ loading: true });
    currentKey = key;

    try {
      const res = await getPosts({ ...params, page });

      const newPosts = res?.data?.data || [];

      currentPage = page;

      set({
        posts: loadMore
          ? [...get().posts, ...newPosts] // 👈 nối thêm
          : newPosts,
        loading: false,
        hasMore: !!res?.data?.next_page_url,
      });

      return newPosts;
    } catch (err) {
      console.error("Lỗi fetch posts:", err);
      set({ loading: false });
      return [];
    }
  },

  fetchPostDetail: async (id) => {
    const sid = String(id);
    const cached = get().postDetail[sid];
    if (cached) return cached;

    if (detailPromises[sid]) return detailPromises[sid];

    detailPromises[sid] = (async () => {
      try {
        const res = await getPostDetail(id);

        const data = res?.data || null;

        set({
          postDetail: {
            ...get().postDetail,
            [sid]: data,
          },
        });

        return data;
      } catch (err) {
        console.error("Lỗi fetch post detail:", err);
        return null;
      } finally {
        delete detailPromises[sid];
      }
    })();

    return detailPromises[sid];
  },

  createPost: async (formData) => {
    try {
      const res = await createPost(formData);

      // thêm vào đầu list
      const newPost = res?.data;

      set({
        posts: [newPost, ...get().posts],
      });

      return res;
    } catch (err) {
      console.error("Lỗi create post:", err);
      throw err;
    }
  },

  updatePost: async (id, formData) => {
    try {
      const res = await updatePost(id, formData);
      const updated = res?.data;

      set({
        posts: get().posts.map((p) => (p.id === id ? updated : p)),
        postDetail: {
          ...get().postDetail,
          [id]: updated,
        },
      });

      return res;
    } catch (err) {
      console.error("Lỗi update post:", err);
      return null;
    }
  },

  deletePost: async (id) => {
    try {
      await deletePost(id);

      set({
        posts: get().posts.filter((p) => p.id !== id),
      });

      return true;
    } catch (err) {
      console.error("Lỗi delete post:", err);
      return false;
    }
  },

  fetchMatches: async (id) => {
    if (get().matches[id]) return get().matches[id];

    set({ loadingMatches: true });

    try {
      const res = await getPostMatches(id);

      const data = res?.data || [];

      set({
        matches: {
          ...get().matches,
          [id]: data,
        },
        loadingMatches: false,
      });

      return data;
    } catch (err) {
      console.error("Lỗi fetch matches:", err);
      set({ loadingMatches: false });
      return [];
    }
  },
}));

export default usePostStore;
