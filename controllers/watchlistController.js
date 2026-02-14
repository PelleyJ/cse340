const utilities = require("../utilities")
const watchlistModel = require("../models/watchlist-model")
const invModel = require("../models/inventory-model")

const watchlistController = {}

// Watchlist page
watchlistController.buildWatchlist = async function (req, res) {
  const nav = await utilities.getNav(req, res)
  const account_id = res.locals.accountData.account_id

  const items = await watchlistModel.getWatchlistByAccountId(account_id)

  res.render("account/watchlist", {
    title: "My Watchlist",
    nav,
    items,
  })
}

// Add item to watchlist
watchlistController.addItem = async function (req, res) {
  const account_id = res.locals.accountData.account_id
  const inv_id = Number(req.body.inv_id)

  if (!Number.isInteger(inv_id) || inv_id <= 0) {
    req.flash("notice", "Invalid vehicle id.")
    return res.redirect("/inv/")
  }

  // ✅ FIXED: match YOUR inventory model function name
  const inv = await invModel.getInventoryById(inv_id)
  if (!inv) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/inv/")
  }

  await watchlistModel.addToWatchlist(account_id, inv_id)

  req.flash("notice", "Saved to your watchlist.")
  return res.redirect(`/inv/detail/${inv_id}`)
}

// Remove item from watchlist
watchlistController.removeItem = async function (req, res) {
  const account_id = res.locals.accountData.account_id
  const inv_id = Number(req.body.inv_id)

  if (!Number.isInteger(inv_id) || inv_id <= 0) {
    req.flash("notice", "Invalid vehicle id.")
    return res.redirect("/account/watchlist")
  }

  await watchlistModel.removeFromWatchlist(account_id, inv_id)

  req.flash("notice", "Removed from your watchlist.")
  return res.redirect("/account/watchlist")
}

module.exports = watchlistController
