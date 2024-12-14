// SUPABASE BACKEND
// import { writable } from 'svelte/store';
import type { User } from "@supabase/supabase-js";
// import type { Contact } from '$lib/types/contact.ts';

import { supabase } from "$lib/services/supabase.ts";
export { supabase }; // Add this line to export the supabase object
import { locale } from "$lib/i18n/index.ts";
import type { Database } from "$lib/types/database.types";
import { getOrgById } from "./orgService.svelte";
export type Profile = Database["public"]["Tables"]["profiles"]["Insert"];
//export type Org = Database["public"]["Tables"]["orgs"]["Insert"];
export interface Org {
  id: string;
  title: string;
  created_at: string;
  metadata: any;
  user_role: string;
}

let user = $state<User | null>(null);
let profile = $state<Profile | null>(null);
let currentOrg = $state<Org | null>(null);
let isUpdatingUserMetadata = $state(false);

// Add this getter function
export function getUser() {
  return user;
}
export const getProfile = () => {
  return profile;
};
export const getCurrentOrg = () => {
  return currentOrg;
};
export const setUser = (newUser: User | null) => {
  user = newUser;
};
export function initializeUser() {
  $effect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      user = session?.user ?? null;
      if (user) loadProfile();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        user = session?.user ?? null;
        if (user) loadProfile();
        const userLocale = user?.user_metadata?.i18n;
        if (userLocale) {
          locale.set(userLocale);
          localStorage.setItem("locale", userLocale);
        }
        // Only update current org if we're not in the middle of updating metadata
        if (!isUpdatingUserMetadata) {
          const newCurrentOrgId = user?.user_metadata?.currentOrgId;
          if (newCurrentOrgId) {
            // Skip metadata update when called from auth state change
            updateCurrentOrg(newCurrentOrgId, true);
          }
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  });
}
export async function updateCurrentOrg(orgId: string | null, skipMetadataUpdate: boolean = false): Promise<boolean> {
  if (!orgId) {
    currentOrg = null;
    return true;
  }

  try {
    const { data, error } = await getOrgById(orgId);
    if (error) {
      console.error("Error fetching org:", error);
      currentOrg = null;
      return false;
    }

    // Update the current org in state
    currentOrg = data;

    // Persist the selected org ID in user metadata only if not skipped
    if (user && !isUpdatingUserMetadata && !skipMetadataUpdate) {
      isUpdatingUserMetadata = true;
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { currentOrgId: orgId },
        });

        if (updateError) {
          console.error("Error updating user metadata:", updateError);
          return false;
        }
      } finally {
        isUpdatingUserMetadata = false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating current org:", error);
    return false;
  }
}

// **************************
// **** DATABASE ACTIONS ****
// **************************

export const getItemById = async (
  collection: string,
  id: string,
  filterColumn?: string,
  filterValue?: string,
) => {
  let query = supabase
    .from(collection)
    .select("*")
    .eq("id", id);

  if (filterColumn && filterValue) {
    query = query.eq(filterColumn, filterValue);
  }

  const { data, error } = await query.single();
  if (error) {
    console.error("error", error);
  }

  return {
    data,
    error,
  };
};

export const deleteItem = async (
  collection: string,
  id: string,
  filterColumn?: string,
  filterValue?: string,
) => {
  let query = supabase
    .from(collection)
    .delete()
    .eq("id", id);

  if (filterColumn && filterValue) {
    query = query.eq(filterColumn, filterValue);
  }

  const { error } = await query;
  return {
    error,
  };
};

export const saveItem = async (collection: string, item: any) => {
  const { data, error } = await supabase
    .from(collection)
    .upsert(item);
  return {
    data,
    error,
  };
};

export const getList = async (
  collection: string,
  startingIndex: number,
  perPage: number,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  filterColumn?: string,
  filterValue?: string,
) => {
  let query = supabase
    .from(collection)
    .select("*")
    .order(sortColumn, { ascending: sortDirection === "asc" })
    .range(startingIndex - 1, startingIndex + perPage - 1);

  if (filterColumn && filterValue) {
    query = query.eq(filterColumn, filterValue);
  }

  const { data, error } = await query;

  return { data, error }; // data || [];
};

// ************************
// **** AUTHENTICATION ****
// ************************

export const getAvatarUrl = (user: User | null) => {
  if (!user) {
    return "";
  }
  return user?.user_metadata?.picture || "";
};

export const signInWithPassword = async (email: string, password: string) => {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    return signInError;
  } else {
    return "";
  }
};

export const signUp = async (
  email: string,
  password: string,
  data?: any,
) => {
  const currentLanguage = localStorage.getItem("locale") || "en";
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        language: currentLanguage,
        i18n: currentLanguage,
        firstname: data?.firstname,
        lastname: data?.lastname,
      },
    },
  });
  return String(signUpError);
};

export const signInWithOAuth = async (provider: string) => {
  let currentUrl = window.location.href;
  localStorage.setItem("redirectUrl", currentUrl);
  const { error: signInError } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin + "/auth/redirect"}`, //currentUrl ? currentUrl :`${window.location.origin}/`
    },
  });
  return signInError;
};

export const resetPasswordForEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return {
    data,
    error,
  };
};

export async function loadProfile() {
  if (!user?.id) {
    console.log("loadProfile:No user logged in");
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) {
    console.error("loadProfile error", error);
    profile = null;
  }
  if (data) {
    profile = data;
  }
}

export async function updateProfile(
  { firstname, lastname, bio }: {
    firstname?: string;
    lastname?: string;
    bio?: string;
  },
) {
  if (!user?.id) return { error: new Error("No user logged in") };
  const { data, error } = await supabase
    .from("profiles")
    .update({
      firstname,
      lastname,
      bio,
    })
    .eq("id", user.id)
    .select()
    .single();
  return { data, error };
}

export const updateUser = async (obj: any) => {
  const { data, error } = await supabase.auth.updateUser(obj);
  return {
    data,
    error,
  };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    user = null;
    profile = null;
    currentOrg = null;
  }

  return {
    error,
  };
};
