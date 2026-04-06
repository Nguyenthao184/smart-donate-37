import { useEffect } from "react";
import useCampaignStore from "../store/campaignStore";

const useCampaigns = () => {
  const {
    featured,
    campaigns,
    fetchFeatured,
    fetchCampaigns,
    loading,
  } = useCampaignStore();

  useEffect(() => {
    fetchFeatured();  
    fetchCampaigns();  
  }, []);

  return {
    featured,
    campaigns,
    loading,
  };
};

export default useCampaigns;