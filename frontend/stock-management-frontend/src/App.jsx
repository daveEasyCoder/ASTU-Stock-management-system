import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import UserLoginPage from './pages/userPages/UserLoginPage'
import AdminLayout from './pages/adminPages/AdminLayout'
import UserList from './pages/adminPages/UserList'
import CreateCategory from './pages/adminPages/CreateCategory'
import CreateUser from './pages/adminPages/CreateUser'
import UserDetail from './pages/adminPages/UserDetail'
import UpdateUser from './pages/adminPages/UpdateUser'
import CategoryList from './pages/adminPages/CategoryList'
import CategoryDetail from './pages/adminPages/CategoryDetail'
import UpdateCategory from './pages/adminPages/UpdateCategory'
import CreateDepartment from './pages/adminPages/CreateDepartment'
import DepartmentList from './pages/adminPages/DepartmentList'
import DepartmentDetail from './pages/adminPages/DepartmentDetail'
import UpateDepartment from './pages/adminPages/UpdateDepartment'
import CreateSupplier from './pages/adminPages/CreateSupplier'
import SupplierList from './pages/adminPages/SupplierList'
import UpdateSupplier from './pages/adminPages/UpdateSupplier'
import CreateItem from './pages/adminPages/CreateItem'
import ItemList from './pages/adminPages/ItemList'
import ItemDetail from './pages/adminPages/ItemDetail'
import UpdateItem from './pages/adminPages/UpdateItem'
import CreatePurchase from './pages/adminPages/CreatePurchase'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<UserLoginPage />} />

      <Route path='/admin' element={<AdminLayout />}>

          // User routes
        <Route path='user-list' element={<UserList />} />
        <Route path='create-user' element={<CreateUser />} />
        <Route path='user-detail/:id' element={<UserDetail />} />
        <Route path='update-user/:id' element={<UpdateUser />} />

          // Category routes
        <Route path='create-category' element={<CreateCategory />} />
        <Route path='category-list' element={<CategoryList />} />
        <Route path='category-detail/:id' element={<CategoryDetail />} />
        <Route path='update-category/:id' element={<UpdateCategory />} />

           // Department Routes
        <Route path='create-department' element={<CreateDepartment />} />
        <Route path='department-list' element={<DepartmentList />} />
        <Route path='department-detail/:id' element={<DepartmentDetail />} />
        <Route path='update-department/:id' element={<UpateDepartment />} />

          // Supplier Routes
        <Route path='create-supplier' element={<CreateSupplier />} />
        <Route path='supplier-list' element={<SupplierList />} />
        <Route path='update-supplier/:id' element={<UpdateSupplier />} />

          // Item routes
        <Route path='create-item' element={<CreateItem />} />
        <Route path='item-list' element={<ItemList />} />
        <Route path='item-detail/:id' element={<ItemDetail />} />
        <Route path='update-item/:id' element={<UpdateItem />} />

          // Item routes
        <Route path='create-purchase' element={<CreatePurchase />} />

      </Route>
    </Routes>
  )
}

export default App
