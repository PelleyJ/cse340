const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")

const validate = {}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check reg data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check login data and return errors or continue to login process
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
 *  Account Update Validation Rules
 * ********************************* */
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_id")
      .trim()
      .notEmpty()
      .withMessage("Account ID is missing."),
  ]
}

/* ******************************
 * Check update data + enforce email uniqueness if changed
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body

  let nav = await utilities.getNav()
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  // If email changed, ensure it's not already used by someone else
  const current = await accountModel.getAccountById(parseInt(account_id))
  if (current && current.account_email !== account_email) {
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists) {
      req.flash("notice", "Email exists. Please use a different email.")
      return res.render("account/update", {
        title: "Update Account",
        nav,
        errors: [{ msg: "Email exists. Please use a different email." }],
        account_firstname,
        account_lastname,
        account_email,
      })
    }
  }

  next()
}

/*  **********************************
 *  Password Update Rules 
 * ********************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),

    body("account_id")
      .trim()
      .notEmpty()
      .withMessage("Account ID is missing."),
  ]
}

/* ******************************
 * Check password update data
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  let nav = await utilities.getNav()
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    req.flash("notice", "Please correct the password and try again.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
    })
  }
  next()
}

module.exports = validate
