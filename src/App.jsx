import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import NewOrder from "./pages/NewOrder";
import CustomerDetail from "./pages/CustomerDetail"; // İşte hata veren satır burasıydı

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/new-order" element={<NewOrder />} />
        {/* Detay sayfası rotası */}
        <Route path="/customers/:id" element={<CustomerDetail />} />
      </Routes>
    </div>
  );
}

export default App;