import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import useProfileStore from "../store/profileStore";

const useProfile = () => {
  const { user } = useAuthStore();

  const {
    profile,
    donations,
    myPosts,
    myCampaigns,
    loadingProfile,
    loadingDonations,
    loadingPosts,
    loadingCampaigns,
    postsHasMore,
    donationsHasMore,
    campaignsHasMore,
    fetchProfile,
    fetchDonations,
    fetchMyPosts,
    fetchMyCampaigns,
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateDiaChi,
    reset,
  } = useProfileStore();

  useEffect(() => {
    // Reset store trước khi fetch để tránh hiện data cũ khi đổi tài khoản
    reset();
    if (!user?.id) return;
    fetchProfile();
    fetchDonations(false);
    fetchMyPosts(false);
    fetchMyCampaigns(false);
  }, [user?.id]);

  return {
    profile,
    donations,
    myPosts,
    myCampaigns,
    loading: loadingProfile,
    loadingDonations,
    loadingPosts,
    loadingCampaigns,
    postsHasMore,
    donationsHasMore,
    campaignsHasMore,
    loadMorePosts: () => fetchMyPosts(true),
    loadMoreDonations: () => fetchDonations(true),
    loadMoreCampaigns: () => fetchMyCampaigns(true),
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateDiaChi,
  };
};

export default useProfile;