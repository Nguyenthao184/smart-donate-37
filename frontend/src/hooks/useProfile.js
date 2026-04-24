import { useEffect } from "react";
import useProfileStore from "../store/profileStore";
import useAuthStore from "../store/authStore";

const useProfile = () => {
  const { user } = useAuthStore();
  const storeRoles = useAuthStore((s) => s.roles);

  const isOrganization = Array.isArray(storeRoles)
    ? storeRoles.some((r) => r === "TO_CHUC" || r?.ten === "TO_CHUC" || r?.ten_vai_tro === "TO_CHUC")
    : false;

  const {
    profile,
    donations,
    myPosts,
    myCampaigns,
    loadingProfile,
    loadingDonations,
    loadingPosts,
    loadingCampaigns,
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
    fetchDonations();
    fetchMyPosts(user?.id);
    // Chỉ fetch campaigns nếu là tổ chức
    if (isOrganization) {
      fetchMyCampaigns();
    }
  }, [user?.id, isOrganization]);

  return {
    profile,
    donations,
    myPosts,
    myCampaigns,
    loading: loadingProfile,
    loadingDonations,
    loadingPosts,
    loadingCampaigns,
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateDiaChi,
  };
};

export default useProfile;