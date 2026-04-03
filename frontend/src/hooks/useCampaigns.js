import { useEffect } from "react";
import useCampaignStore from "../store/campaignStore";

const useCampaigns = () => {
  const { featured, fetchFeatured, loading } = useCampaignStore();

  useEffect(() => {
    fetchFeatured();
  }, []);

  return {
    campaigns: featured,
    loading,
  };
};

export default useCampaigns;