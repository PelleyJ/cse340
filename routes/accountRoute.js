const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

// Server-side validation
const regValidate = require("../utilities/account-validation")

// Deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data (POST)
router.post(
  "/register",
  regValidate.registationRules(), // (handout spelling supported)
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
