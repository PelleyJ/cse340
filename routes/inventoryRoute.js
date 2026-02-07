const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Inventory management view (PROTECTED)
router.get(
  "/",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement)
)

// Return inventory by classification as JSON (AJAX) (PROTECTED - used by admin screens)
router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Add classification (PROTECTED)
router.get(
  "/add-classification",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification)
)
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Add inventory (PROTECTED)
router.get(
  "/add-inventory",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory)
)
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Edit inventory view (Step 1) (PROTECTED)
router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView)
)

// Update inventory (Step 2) (PROTECTED)
router.post(
  "/update/",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

/* ***************************
 * Delete confirmation view (PROTECTED)
 * ************************** */
router.get(
  "/delete/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteConfirm)
)

/* ***************************
 * Process delete inventory (PROTECTED)
 * ************************** */
router.post(
  "/delete/",
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventory)
)

// Inventory by classification (PUBLIC - do NOT protect)
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Inventory detail view (PUBLIC - do NOT protect)
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInventoryId)
)

module.exports = router
