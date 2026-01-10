const express = require("express");
const router = express.Router();

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "/public/css"));
router.use("/js", express.static(__dirname + "/public/js"));
router.use("/images", express.static(__dirname + "/public/images"));

// Inventory placeholder routes (so nav links are not broken)
router.get("/inv/custom", (req, res) => {
  res.render("inventory", { title: "Custom Vehicles" });
});

router.get("/inv/sedan", (req, res) => {
  res.render("inventory", { title: "Sedan Vehicles" });
});

router.get("/inv/suv", (req, res) => {
  res.render("inventory", { title: "SUV Vehicles" });
});

router.get("/inv/truck", (req, res) => {
  res.render("inventory", { title: "Truck Vehicles" });
});

module.exports = router;
