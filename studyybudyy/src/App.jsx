import React from 'react'
import { RouterProvider } from 'react-router-dom';
import router from './Routes/route';
import './app.css'
import { Provider } from 'react-redux';
import {store} from './store'

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router}>

      </RouterProvider>
    </Provider>
  )
}

export default App