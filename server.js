/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 * *******************************************/

/* ***********************
 * Require Statements
 * *********************** */
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const session = require("express-session")
const pool = require("./database/")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const utilities = require("./utilities/")

const app = express()

/* ***********************
 * Routes
 * *********************** */
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")

// Watchlist routes
const watchlistRoute = require("./routes/watchlistRoute")

/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
  })
)

// Express Messages Middleware
app.use(require("connect-flash")())
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

// Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Cookie Parser Middleware
app.use(cookieParser())

// JWT Check Middleware (applies to ALL routes)
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 * *********************** */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 * *********************** */
app.use(staticRoutes)

// Index route (MVC)
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

// Watchlist routes (must come AFTER account middleware)
app.use("/account/watchlist", watchlistRoute)

/* ***********************
 * 404 Handler (must be AFTER all routes)
 * *********************** */
app.use((req, res, next) => {
  const err = new Error("Sorry, we couldn’t find that page.")
  err.status = 404
  next(err)
})

/* ***********************
 * Express Error Handler
 * *********************** */
app.use(async (err, req, res, next) => {
  console.error(err)

  try {
    const nav = await utilities.getNav(req, res)

    res.status(err.status || 500).render("errors/error", {
      title: err.status ? `${err.status} Error` : "500 - Server Error",
      nav,
      message: err.message || "Something went wrong.",
    })
  } catch (renderErr) {
    res.status(500).send("Server error.")
  }
})

/* ***********************
 * Local Server Information
 * *********************** */
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 * *********************** */
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
