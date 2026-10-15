import React from "react";
import { AdminPanel } from "./AdminPanel";

// Compatibilidad con imports antiguos. La lógica de administración vive en
// AdminPanel y usa publicaciones/métodos protegidos del servidor.
export const Admin = () => <AdminPanel />;
