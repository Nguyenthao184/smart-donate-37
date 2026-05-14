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

  // ✅ Listen realtime events từ notificationStore để tự động refetch data
  useEffect(() => {
    if (!user?.id) return;

    // Khi tổ chức được duyệt/từ chối → refetch profile để hiện block tổ chức
    const handleRefreshOrg = () => {
      fetchProfile();
    };

    // Khi chiến dịch được duyệt/từ chối/tạo mới → refetch campaigns
    const handleRefreshCampaigns = () => {
      fetchMyCampaigns(false);
    };

    // Khi tài khoản user bị khóa/mở khóa
    const handleRefreshUser = () => {
      fetchProfile();
    };

    window.addEventListener("profile:refresh-org", handleRefreshOrg);
    window.addEventListener("profile:refresh-campaigns", handleRefreshCampaigns);
    window.addEventListener("profile:refresh-user", handleRefreshUser);

    return () => {
      window.removeEventListener("profile:refresh-org", handleRefreshOrg);
      window.removeEventListener("profile:refresh-campaigns", handleRefreshCampaigns);
      window.removeEventListener("profile:refresh-user", handleRefreshUser);
    };
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