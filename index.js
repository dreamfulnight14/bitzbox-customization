const express = require('express')
const cors = require('cors')

const {
  getOrderedCategories,
  getAllProducts,
  getProductById,
} = require('./service')

const app = express()
const port = process.env.PORT || 8000

app.use(cors())

app.get('/categories/ordered', async (req, res) => {
  try {
    res.status(200).json(await getOrderedCategories())
  } catch (error) {
    console.log(error)
    res.status(400).json({
      success: false,
      data: null,
      message: error.toString(),
    })
  }
})

app.get('/products', async (req, res) => {
  try {
    res.status(200).json(await getAllProducts())
  } catch (error) {
    console.log(error)
    res.status(400).json({
      success: false,
      data: null,
      message: error.toString(),
    })
  }
})

app.get('/products/:id', async (req, res) => {
  res.json(await getProductById(req.params.id))
})

app.listen(port, async () => {
  console.log(`app is running on port ${port}`)
})
