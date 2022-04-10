const config = require('config')
const Koa = require('koa')

const path = require('path')
const Router = require('koa-router')

const loadRoutes = require("./app/routes")
const DataLoader = require('./app/dataLoader')

const views = require('koa-views')
const serve = require('koa-static')

const app = new Koa()
const router = new Router()

// Views setup, adds render() function to ctx object
app.use(views(
  path.join(__dirname, config.get('views.path')),
  config.get('views.options')
))

// Serve static files (scripts, css, images)
app.use(serve(config.get('static.path')))

// Hydrate ctx.state with global settings, so they are available in views
app.use(async (ctx, next) => {
  ctx.state.settings = config.get('settings')
  ctx.state.urlWithoutQuery = ctx.origin + ctx.path
  await next()  // Pass control to the next middleware
})

// Then, we will add a custom script that will read our products JSON files
const productsLoader = new DataLoader(
  path.join(
    __dirname,
    config.get('data.path'),
    'products')
)

// Configure router
loadRoutes(router, productsLoader)
app.use(router.routes())

// Start the app
const port = process.env.PORT || config.get('server.port')
app.listen(port, () => { console.log(`Application started - listening on port ${port}`) })
