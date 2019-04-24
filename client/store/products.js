import axios from 'axios'

//Action Types
const GET_PRODUCTS = 'GET_PRODUCTS'
const CREATE_PRODUCT = 'CREATE_PRODUCT'
const EDIT_PRODUCT = 'EDIT_PRODUCT'
const FILTERED_PRODUCTS = 'FILTERED_PRODUCT'

//Initial State
const defaultProducts = []

//Action Creator
const getProducts = products => {
  return {
    type: GET_PRODUCTS,
    products
  }
}
const createNewProduct = newProduct => {
  return {
    type: CREATE_PRODUCT,
    newProduct
  }
}
const editProduct = (id, newProductInfo) => {
  return {
    type: EDIT_PRODUCT,
    id,
    newProductInfo
  }
}

const filteredProducts = (filtProducts) => {
  return {
    type: FILTERED_PRODUCTS,
    filtProducts
  }
}

//Thunk Creator

export const fetchProducts = (page, categories = []) => {
  return async dispatch => {
    try {

      const res = await axios.get(`/api/products/all/${page}`, {params:
        {categories: categories}
      })
      dispatch(getProducts(res.data || defaultProducts))
    } catch (err) {
      console.error(err)
    }
  }
}
export const addNewProduct = newProduct => {
  return async dispatch => {
    try {
      const {data} = await axios.post(`/api/adminpanel/postproduct`, newProduct)
      dispatch(createNewProduct(data))
    } catch (error) {
      console.log(error)
    }
  }
}
export const editOneProduct = (id, newProductInfo) => {
  return async dispatch => {
    try {
      await axios.put(`/api/products/${id}/editproduct`, newProductInfo)
      dispatch(editProduct(id, newProductInfo))
    } catch (error) {
      console.log(`ERROR editing product with id ${id}.`, error)
    }
  }
}

export const getFilteredProducts = (search) => {
  return async dispatch => {
    try {
      console.log('SEARCH', search)
      const res = await axios.get(`/api/products/candy/search?search=${search.search}`)
      dispatch(filteredProducts(res.data))
    } catch (err) {
      console.error(err)
    }
  }
}


//Reducer

const productsReducer = (state = defaultProducts, action) => {
  switch (action.type) {
    case GET_PRODUCTS:
      return action.products
    case CREATE_PRODUCT:
      return [...state, action.newProduct]
    case EDIT_PRODUCT:
      return [...state, action.newProductInfo]
    case FILTERED_PRODUCTS:
      return action.filtProducts
    default:
      return state
  }
}

export default productsReducer
