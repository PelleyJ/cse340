const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav(req, res)
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav(req, res)
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav(req, res)
  const { account_firstname, account_lastname, account_email, account_password } =
    req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav(req, res)
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Deliver account update view
 * *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav(req, res)
  const account_id = parseInt(req.params.account_id)

  // Safety: only allow logged-in user to access their own update page
  if (
    !res.locals.accountData ||
    Number(res.locals.accountData.account_id) !== Number(account_id)
  ) {
    req.flash("notice", "You do not have permission to access that page.")
    return res.redirect("/account/")
  }

  const account = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: account.account_firstname,
    account_lastname: account.account_lastname,
    account_email: account.account_email,
  })
}

/* ****************************************
 *  Process account info update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav(req, res)
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body

  // Safety: only allow logged-in user to update themselves
  if (
    !res.locals.accountData ||
    Number(res.locals.accountData.account_id) !== Number(account_id)
  ) {
    req.flash("notice", "You do not have permission to update that account.")
    return res.redirect("/account/")
  }

  const updateResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    parseInt(account_id)
  )

  if (!updateResult) {
    req.flash("notice", "Sorry, the account update failed.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  // Refresh JWT so header + views reflect updated name/email immediately
  const fresh = await accountModel.getAccountById(parseInt(account_id))
  delete fresh.account_password

  const newToken = jwt.sign(fresh, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  })

  if (process.env.NODE_ENV === "development") {
    res.cookie("jwt", newToken, {
      httpOnly: true,
      maxAge: 3600 * 1000,
    })
  } else {
    res.cookie("jwt", newToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 1000,
    })
  }

  req.flash("notice", "Account information updated successfully.")
  return res.redirect("/account/")
}

/* ****************************************
 *  Process password change
 * *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav(req, res)
  const { account_password, account_id } = req.body

  // Safety: only allow logged-in user to update themselves
  if (
    !res.locals.accountData ||
    Number(res.locals.accountData.account_id) !== Number(account_id)
  ) {
    req.flash("notice", "You do not have permission to update that password.")
    return res.redirect("/account/")
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating the password.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    })
  }

  const result = await accountModel.updatePassword(
    hashedPassword,
    parseInt(account_id)
  )

  if (!result) {
    req.flash("notice", "Sorry, the password update failed.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    })
  }

  req.flash("notice", "Password updated successfully.")
  return res.redirect("/account/")
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav(req, res)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (passwordMatch) {
      delete accountData.account_password

      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      )

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          maxAge: 3600 * 1000,
        })
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        })
      }

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
 *  Logout
 * *************************************** */
async function logout(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  accountLogin,
  logout,
}
