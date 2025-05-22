// Copyright © 2024 Navarrotech

// React.js
import { createRoot } from 'react-dom/client'

// Router
import { Navigate, Routes, Route } from "react-router"
import { BrowserRouter } from "react-router-dom"

// Redux
import { Provider as ReduxProvider } from 'react-redux'
import store from './store/store'

// Chart.js
import { Chart, BarElement, ArcElement, Tooltip, LinearScale, CategoryScale, Filler } from 'chart.js'

// Core CSS packages
import './index.sass'
import 'bulma-tooltip/dist/css/bulma-tooltip.min.css'

// Middleware
import CheckAuth from './middleware/CheckAuth'
import Initialization from './middleware/Initialization'

// Pages
import Dashboard from './pages/Dashboard'
import AutoTags from './pages/AutoTags'
import TagsInventory from "./pages/TagInventory"
import YearToDate from './pages/YearToDate'
import { WidgetOutlet } from './widget/WidgetOutlet'

Chart.register([
  ArcElement,
  Tooltip,
  LinearScale,
  CategoryScale,
  BarElement,
  Filler
])

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)

root.render(
  <CheckAuth>
    <ReduxProvider store={store}>
      <BrowserRouter>
        <Initialization>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<WidgetOutlet />}>
              <Route index path="/" element={<Dashboard />} />
              <Route path="/rules" element={<AutoTags />} />
              <Route path="/tags" element={<TagsInventory />} />
              <Route path="/dashboard" element={<YearToDate />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Initialization>
      </BrowserRouter>
    </ReduxProvider>
  </CheckAuth>
)
