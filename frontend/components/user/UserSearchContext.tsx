"use client";

import { createContext, useContext, useState } from "react";

type UserSearchContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const UserSearchContext = createContext<UserSearchContextValue | null>(null);

export function UserSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <UserSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </UserSearchContext.Provider>
  );
}

export function useUserSearch() {
  const context = useContext(UserSearchContext);

  if (!context) {
    throw new Error("useUserSearch must be used within UserSearchProvider");
  }

  return context;
}
