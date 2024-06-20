const express = require('express')
const cors = require('cors')

const { getOrderedCategories } = require('./service')

const app = express()
const port = 8000

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

app.listen(port, async () => {
  console.log(`app is running on port ${port}`)
})
