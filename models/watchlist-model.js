const pool = require("../database/")

async function addToWatchlist(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO public.watchlist (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT (account_id, inv_id) DO NOTHING
      RETURNING watchlist_id;
    `
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    console.error("addToWatchlist error:", error)
    throw error
  }
}

async function removeFromWatchlist(account_id, inv_id) {
  try {
    const sql = `
      DELETE FROM public.watchlist
      WHERE account_id = $1 AND inv_id = $2
      RETURNING watchlist_id;
    `
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    console.error("removeFromWatchlist error:", error)
    throw error
  }
}

async function getWatchlistByAccountId(account_id) {
  try {
    const sql = `
      SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail
      FROM public.watchlist w
      JOIN public.inventory i ON w.inv_id = i.inv_id
      WHERE w.account_id = $1
      ORDER BY w.created_at DESC;
    `
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getWatchlistByAccountId error:", error)
    throw error
  }
}

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlistByAccountId,
}
