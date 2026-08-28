import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Helper to fetch data with fallback to LocalStorage
export const fetchInitialData = async ({
  key,
  tableName,
  defaultValue,
  transform = (data) => data
}) => {
  const localSaved = localStorage.getItem(key);
  const fallback = localSaved ? JSON.parse(localSaved) : defaultValue;

  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }

  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error || !data || data.length === 0) {
      return fallback;
    }
    return transform(data);
  } catch (err) {
    console.warn(`Supabase fetch error for ${tableName}:`, err);
    return fallback;
  }
};

// Sync item to Supabase table
export const syncToSupabase = async (tableName, record) => {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from(tableName).upsert(record);
  } catch (err) {
    console.warn(`Supabase upsert error for ${tableName}:`, err);
  }
};

// Delete item from Supabase table
export const deleteFromSupabase = async (tableName, id) => {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from(tableName).delete().eq('id', id);
  } catch (err) {
    console.warn(`Supabase delete error for ${tableName}:`, err);
  }
};
