import { useEffect, useState } from "react";
import { getCategories } from "../api/campaignService";

export default function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetch();
  }, []);

  return { categories };
}