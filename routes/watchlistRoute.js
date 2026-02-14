const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const watchlistController = require("../controllers/watchlistController")

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(watchlistController.buildWatchlist)
)

router.post(
  "/add",
  utilities.checkLogin,
  utilities.handleErrors(watchlistController.addItem)
)

router.post(
  "/remove",
  utilities.checkLogin,
  utilities.handleErrors(watchlistController.removeItem)
)

module.exports = router
