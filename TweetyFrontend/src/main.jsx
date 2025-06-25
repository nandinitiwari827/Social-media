import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Layout from './Layout.jsx'
import Home from './components/Home.jsx'
import About from './components/About.jsx'
import Login1 from './components/Login1.jsx'
import Login2 from './components/Login2.jsx'
import Login from './components/login.jsx'
import UserContextProvider from './contexts/UserContextProvider.jsx'
import YourProfile from './components/YourProfile.jsx'
import { HeartContextProvider } from './contexts/HeartContext.jsx'
import { CommentLikeContextProvider } from './contexts/CommentLike.jsx'
import Layout1 from './Layout1.jsx'
import ContactUs from './ContactUs.jsx'
import ChangeDetails from './components/ChangeDetails.jsx'
import ChangePassword from './components/ChangePassword.jsx'
import PrivateRoute from './PrivateRoute.jsx'

let router = createBrowserRouter([
  {
    path: "account",
    element: <Login1 />,
  },
  {
    path: "accountpage",
    element: <Login2 />,
  },
  {
    path: "login",
    element: <Login />
  },

   {
    element: <PrivateRoute />,
    children: [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "about",
        element: <Layout1 />,
        children:[
          {
          path:"",
          element: <About/>,
          },
        ],
      },
      {
        path: "profile/:id",
        element: <YourProfile />,
      },
      {
        path: "profile",
        element: <YourProfile />,
      },
    ],
  },

 {
    path: "/contactus",
        element: <ContactUs/>,
  },
   {
    path: "changeDetails",
    element: <ChangeDetails/>
  },
  {
    path: "changePassword",
    element: <ChangePassword/>
  },
]}
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <UserContextProvider>
    <HeartContextProvider>
      <CommentLikeContextProvider>
     <RouterProvider router={router}/>
     </CommentLikeContextProvider>
     </HeartContextProvider>
     </UserContextProvider>
  </StrictMode>,
)
