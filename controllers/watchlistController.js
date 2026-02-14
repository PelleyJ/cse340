const utilities = require("../utilities/")
const watchlistModel = require("../models/watchlist-model")
const invModel = require("../models/inventory-model")

async function buildWatchlist(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const account_id = res.locals.accountData.account_id

    const items = await watchlistModel.getWatchlistByAccountId(account_id)

    res.render("account/watchlist", {
      title: "My Watchlist",
      nav,
      items,
    })
  } catch (err) {
    next(err)
  }
}

async function addItem(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const inv_id = Number(req.body.inv_id)

    if (!Number.isInteger(inv_id) || inv_id <= 0) {
      req.flash("notice", "Invalid vehicle id.")
      return res.redirect("/inv/")
    }

    // Server-side validation: ensure inventory exists
    const inv = await invModel.getInventoryByInvId(inv_id)
    if (!inv) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv/")
    }

    await watchlistModel.addToWatchlist(account_id, inv_id)

    req.flash("notice", "Saved to your watchlist.")
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (err) {
    next(err)
  }
}

async function removeItem(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const inv_id = Number(req.body.inv_id)

    if (!Number.isInteger(inv_id) || inv_id <= 0) {
      req.flash("notice", "Invalid vehicle id.")
      return res.redirect("/account/watchlist")
    }

    await watchlistModel.removeFromWatchlist(account_id, inv_id)
    req.flash("notice", "Removed from your watchlist.")
    return res.redirect("/account/watchlist")
  } catch (err) {
    next(err)
  }
}

module.exports = {
  buildWatchlist,
  addItem,
  removeItem,
}
