import { Navigate, Route, Routes } from "react-router-dom";

import { AdminPage } from "../admin/admin-page";
import { ViewerPage } from "../viewer/viewer-page";

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/admin" replace />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/viewer" element={<ViewerPage />} />
  </Routes>
);
