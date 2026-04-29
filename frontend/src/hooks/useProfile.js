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
    fetchProfile,
    fetchDonations,
    fetchMyPosts,
    fetchMyCampaigns,
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateDiaChi,
  } = useProfileStore();

  useEffect(() => {
    fetchProfile();
    fetchDonations(false);
    fetchMyPosts(false);
    fetchMyCampaigns(true);
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
    loadMorePosts: () => fetchMyPosts(true),
    loadMoreDonations: () => fetchDonations(true),
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateDiaChi,
  };
};

export default useProfile;