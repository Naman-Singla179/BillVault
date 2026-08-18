import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateInvoice from './pages/Invoices/CreateInvoice';
import Payments from './pages/Payments/Payments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateInvoice />} />
        <Route path="/payment" element={<Payments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;