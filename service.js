const axios = require('axios')

const apiHost = 'https://api.ecommerceapi.uk/v1'
const apiToken =
  // 'dlAwem1Ed3dyZ3I3T2VZc29VZlVIWk5xOGxlOHRjN1A6eTVla1FyTDk3RVVPTUVyUElrOHRVZlNJTllLTlJRbFg='
  'bHZmSWp0MGt5Q0xsT1pHaTZzNm0ySFhvZ05aNENvNTc6VTdISUtpZWtBaksyeWdVMEg5Z1FKcW1pOWM5T25nSG8='

async function getOrderedCategories() {
  const categories = await getAllCategories()
  console.log('Categories fetched!', categories.length)
  const categoryMap = {}
  categories.map((category) => {
    categoryMap[category.id] = {
      id: category.id,
      title: category.title,
      slug: category.slug,
      parents: category.parents,
      parentSlug: '',
      totalItemsCount: 0,
      outOfStockItemsCount: 0,
    }
  })
  Object.keys(categoryMap).forEach((categoryId) => {
    const parentSlug = getParentSlug(categoryMap, categoryId, '')
    if (parentSlug) {
      categoryMap[categoryId].parentSlug = parentSlug
    }
  })
  const parentCategoryIdObj = new Set()
  Object.keys(categoryMap).forEach((categoryId) => {
    categoryMap[categoryId]?.parents.forEach((parent) => {
      if (categoryMap[parent.id]) {
        parentCategoryIdObj.add(parent.id)
      }
    })
  })
  parentCategoryIdObj.forEach((categoryId) => {
    delete categoryMap[categoryId]
  })
  Object.keys(categoryMap).forEach((categoryId) => {
    const category = categoryMap[categoryId]
    categoryMap[categoryId] = {
      id: category.id,
      title: category.title,
      slug: category.slug,
      parentSlug: category.parentSlug,
      totalItemsCount: category.totalItemsCount,
      outOfStockItemsCount: category.outOfStockItemsCount,
    }
  })
  console.log('Categories Processed!')

  const products = await getAllProducts()
  console.log('Product fetched!', products.length)
  products.forEach((product) => {
    product.categories.forEach((category) => {
      if (categoryMap[category.id]) {
        categoryMap[category.id].totalItemsCount++
        if (product.stock === 0) {
          categoryMap[category.id].outOfStockItemsCount++
        }
      }
    })
  })

  const productCategories = {}
  products.forEach((product) => {
    product.categories.forEach((category) => {
      if (productCategories[category.id]) {
        productCategories[category.id]++
      } else {
        productCategories[category.id] = 1
      }
    })
  })

  const orderedCategories = Object.values(categoryMap)
    .map((category) => ({
      ...category,
      percentage:
        category.totalItemsCount === 0
          ? -1
          : parseInt(
              (category.outOfStockItemsCount * 100) / category.totalItemsCount
            ),
    }))
    .sort((a, b) => b.percentage - a.percentage)
  console.log('Product processed!')

  return { orderedCategories, productCategories }
}

async function getAllProducts() {
  const products = []
  let count = 0
  let currentCount = 1
  while (currentCount > 0) {
    try {
      const result = await axios.get(
        `${apiHost}/products?embed=categories&fields=categories,id&count=200$active=1&offset=${count}`,
        {
          headers: {
            Authorization: `Basic ${apiToken}`,
          },
        }
      )
      currentCount = result.data.length
      count += currentCount
      products.push(...result.data)
      console.log('current fetched product count: ', count)
    } catch (error) {
      console.log(error.message, count)
    }
  }

  return products
}

async function getAllCategories() {
  const categories = []
  let count = 0
  let currentCount = 1
  while (currentCount > 0) {
    try {
      const result = await axios.get(
        `${apiHost}/categories?embed=parents&count=100&offset=${count}&active=1`,
        {
          headers: {
            Authorization: `Basic ${apiToken}`,
          },
        }
      )
      currentCount = result.data.length
      count += currentCount
      categories.push(...result.data)
    } catch (error) {
      console.log(error.message, count)
    }
  }

  return categories
}

async function getProductById(id) {
  try {
    const result = await axios.get(
      `${apiHost}/products/${id}?embed=categories`,
      {
        headers: {
          Authorization: `Basic ${apiToken}`,
        },
      }
    )
    return result.data
  } catch (error) {
    console.log(error.message)
  }
}

async function getProductsCount(id) {
  try {
    const result = await axios.get(`${apiHost}/products/count?active=1`, {
      headers: {
        Authorization: `Basic ${apiToken}`,
      },
    })
    return result.data
  } catch (error) {
    console.log(error.message)
  }
}

function getParentSlug(categoryMap, currentCategoryId, parentSlug) {
  const category = categoryMap[currentCategoryId]
  if (category && category.parents.length > 0) {
    parentSlug = category.parents[0].title + '/' + parentSlug
    return getParentSlug(categoryMap, category.parents[0].id, parentSlug)
  }
  return parentSlug
}

module.exports = {
  getOrderedCategories,
  getAllProducts,
  getAllCategories,
  getProductById,
  getProductsCount,
}
