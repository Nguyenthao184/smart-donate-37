import { useEffect } from "react";
import useOrganizationStore from "../store/organizationStore.js";

const useOrganizations = () => {
  const { organizations, fetchOrganizations } = useOrganizationStore();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
  };
};

export default useOrganizations;