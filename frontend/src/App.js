import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import IcebergDetails from "./pages/IcebergDetails";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  console.log("APP LOADED");
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/iceberg/:id" element={<IcebergDetails />} />
        <Route path="/history/:id" element={<HistoryPage />} />
      </Routes>
    </>
  );
}
