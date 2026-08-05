import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data.data);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = (foodId) => wishlist.some((w) => w.foodId === Number(foodId));

  const toggleWishlist = async (foodId) => {
    if (!isAuthenticated) return false;
    try {
      if (isWishlisted(foodId)) {
        await api.delete(`/wishlist/${foodId}`);
        setWishlist((prev) => prev.filter((w) => w.foodId !== Number(foodId)));
        return false;
      }
      await api.post("/wishlist", { foodId });
      await fetchWishlist();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, fetchWishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
