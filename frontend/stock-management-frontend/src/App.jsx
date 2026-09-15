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
import PurchaseList from './pages/adminPages/PurchaseList'
import PurchaseDetail from './pages/adminPages/PurchaseDetail'
import StockTransactionsByPurchase from './pages/adminPages/StockTransactionsByPurchase'
import Unauthorized from './pages/Unauthorized'
import UserLayout from './pages/userPages/UserLayout'
import AvailableItems from './pages/userPages/AvailableItems'
import CreateStockRequest from './pages/userPages/CreateStockRequest'
import MyRequests from './pages/userPages/MyRequests'
import PendingApprovals from './pages/userPages/PendingApprovals'
import DepartmentRequests from './pages/userPages/DepartmentRequests'
import RequestDetail from './pages/userPages/MyRequestDetail'
import DepartmentDashboard from './pages/userPages/DepartmentDashboard'
import DepartmentReport from './pages/userPages/DepartmentReport'
import UserProfile from './pages/userPages/UserProfile'
import UserRedirect from './pages/userPages/userRedirect'
import StaffDashboard from './pages/userPages/StaffDashboard'
import AllRequests from './pages/adminPages/AllRequests'
import RequestsDetail from './pages/adminPages/RequestsDetail'
import Issuance from './pages/adminPages/Issuance'
import StockTransactions from './pages/adminPages/StockTransactions'
import DashboardRouter from './pages/adminPages/DashboardRouter'
import StockAdjustment from './pages/adminPages/StockAdjustment'
import StockReport from './pages/adminPages/StockReport'
import StaffItemDetail from './pages/userPages/StaffItemDetail'


function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<UserLoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path='/user' element={<UserLayout />}>
        <Route path="" element={<UserRedirect />} />

        <Route path="dashboard" element={<DepartmentDashboard />} />
        <Route path="staff-dashboard" element={<StaffDashboard />} />
        <Route path='items' element={<AvailableItems />} />
        <Route path="staff-item-detail/:id" element={<StaffItemDetail />} />
        <Route path='create-stock-request' element={<CreateStockRequest />} />
        <Route path='my-requests' element={<MyRequests />} />
        <Route path="request-detail/:id" element={<RequestDetail showCancelBtn={true} />} />
        <Route path="pending-approvals" element={<PendingApprovals />} />
        <Route path="pending-approval-detail/:id" element={<RequestDetail showCancelBtn={false} />} />
        <Route path="department-requests" element={<DepartmentRequests />} />
        <Route path="department-request-detail/:id" element={<RequestDetail showCancelBtn={false} />} />
        <Route path="department-report" element={<DepartmentReport />} />
        <Route path="profile" element={<UserProfile />} />


      </Route>




      <Route path='/admin' element={<AdminLayout />}>
          // User routes
        {/* <Route path='' element={<Dashboard />} /> */}
        <Route path='' element={<DashboardRouter />} />

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

          // Purchase routes
        <Route path='create-purchase' element={<CreatePurchase />} />
        <Route path='purchase-list' element={<PurchaseList />} />
        <Route path='purchase-detail/:id' element={<PurchaseDetail />} />

        <Route path='stock-transaction-by-purchase/:purchaseId' element={<StockTransactionsByPurchase />} />
        <Route path='all-requests' element={<AllRequests />} />
        <Route path='requests-detail/:id' element={<RequestsDetail />} />
        <Route path='issuance' element={<Issuance />} />

        // Transactions routes
        <Route path='transactions' element={<StockTransactions />} />

        // Stock-Adjustment routes
        <Route path='stock-adjustment' element={<StockAdjustment />} />

        // Stock-Report routes
        <Route path='stock-report' element={<StockReport />} />


        <Route path="profile" element={<UserProfile />} />
      </Route>

    </Routes>
  )
}

export default App
