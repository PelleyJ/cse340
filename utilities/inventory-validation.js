const { body, validationResult } = require("express-validator")
const utilities = require(".")
const invModel = require("../models/inventory-model")

const validate = {}

// Classification rules
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .isAlphanumeric()
      .withMessage(
        "Classification name must contain only letters and numbers (no spaces or symbols)."
      )
      .isLength({ min: 1, max: 30 })
      .withMessage("Classification name must be 1–30 characters."),
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name,
    })
  }
  next()
}

// Inventory rules
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required.")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Choose a valid classification."),

    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required.")
      .isLength({ min: 2, max: 30 })
      .withMessage("Make must be 2–30 characters."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required.")
      .isLength({ min: 1, max: 30 })
      .withMessage("Model must be 1–30 characters."),

    body("inv_year")
      .notEmpty()
      .withMessage("Year is required.")
      .bail()
      .isInt({ min: 1886, max: 2100 })
      .withMessage("Enter a valid year."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required.")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Description must be 10–5000 characters."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required.")
      .matches(/^\/images\/vehicles\/.+\.(png|jpg|jpeg|webp)$/i)
      .withMessage("Image path must look like /images/vehicles/filename.png"),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required.")
      .matches(/^\/images\/vehicles\/.+\.(png|jpg|jpeg|webp)$/i)
      .withMessage(
        "Thumbnail path must look like /images/vehicles/filename.png"
      ),

    body("inv_price")
      .notEmpty()
      .withMessage("Price is required.")
      .bail()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("inv_miles")
      .notEmpty()
      .withMessage("Miles is required.")
      .bail()
      .isInt({ min: 0 })
      .withMessage("Miles must be 0 or more."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required.")
      .isLength({ min: 3, max: 20 })
      .withMessage("Color must be 3–20 characters."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  )

  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),

      // Sticky values
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
    })
  }

  next()
}

/* ******************************
 * Check data and return errors for Update Inventory
 * Redirects back to the edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList(
    req.body.classification_id
  )
  const itemName = `${req.body.inv_make} ${req.body.inv_model}`

  if (!errors.isEmpty()) {
    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: errors.array(),

      // Sticky values (includes inv_id)
      inv_id: req.body.inv_id,
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
    })
  }

  next()
}

module.exports = validate
