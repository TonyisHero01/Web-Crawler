import { createBrowserRouter } from "react-router-dom"
import Index from "@/pages/Index"
import MainLayout from "@/components/MainLoyout"

const router = createBrowserRouter([
  { path: '/', Component: MainLayout,children:[
    { index: true, Component: Index },
    { path: 'Index', Component: Index },
  ] },
])

export default router