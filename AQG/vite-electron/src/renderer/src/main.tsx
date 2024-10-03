import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App'
import Test from './pages/Docs'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Generate from './pages/Generate'

const pages = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/docs',
    element: <Test />
  },
  {
    path: '/generate',
    element: <Generate />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={pages} />
  </React.StrictMode>
)
