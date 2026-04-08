import { useEffect } from "react";
import useProfileStore from "../store/profileStore";
import useAuthStore from "../store/authStore";

const useProfile = () => {
  const { user } = useAuthStore();

  const {
    profile,
    donations,
    myPosts,
    loadingProfile,
    loadingDonations,
    loadingPosts,
    fetchProfile,
    fetchDonations,
    fetchMyPosts,
    handleUpdateProfile,
    handleChangePassword,
  } = useProfileStore();

  useEffect(() => {
    fetchProfile();
    fetchDonations();
    fetchMyPosts(user?.id);
  }, [user?.id]);

  return {
    profile,
    donations,
    myPosts,
    loading: loadingProfile,
    loadingDonations,
    loadingPosts,
    handleUpdateProfile,
    handleChangePassword,
  };
};

export default useProfile;