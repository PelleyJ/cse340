/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 * ***************************************** */

/* ***********************
 * Require Statements
 * *********************** */
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()

// Routes
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")

/* ***********************
 * View Engine and Templates
 * *********************** */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 * *********************** */
app.use(staticRoutes)

// Index route (MVC)
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * 404 Handler (must be AFTER all routes)
 * (Send to error handler middleware)
 * *********************** */
app.use((req, res, next) => {
  const err = new Error("Sorry, we couldn’t find that page.")
  err.status = 404
  next(err)
})

/* ***********************
 * Express Error Handler (must have 4 params)
 * Adds nav so layout/partials don't crash
 * *********************** */
app.use(async (err, req, res, next) => {
  console.error(err)

  try {
    const utilities = require("./utilities/")
    const nav = await utilities.getNav()

    res.status(err.status || 500).render("errors/error", {
      title: err.status ? `${err.status} Error` : "500 - Server Error",
      nav,
      message: err.message || "Something went wrong.",
    })
  } catch (renderErr) {
    // If rendering the error page fails, fall back to plain text
    res.status(500).send("Server error.")
  }
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 * *********************** */
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 * *********************** */
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
