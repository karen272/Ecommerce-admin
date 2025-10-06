// src/pages/Dashboard/Home.tsx
import PageMeta from "../../components/common/PageMeta";
import ProductList from "../../components/ecommerce/ProductList";
import CreateProductModal from "../../components/ecommerce/CreateProductModal";
import { useState } from "react";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reloadProducts, setReloadProducts] = useState(false);

  const handleProductCreated = () => {
    // Forzar recarga de productos en ProductList
    setReloadProducts((prev) => !prev);
  };

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      
      {/* Modal de creación */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={handleProductCreated}
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <ProductList key={reloadProducts ? "reload" : "default"} />
        </div>
      </div>

      {/* Botón flotante para crear (opcional) */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-40"
        aria-label="Crear Producto"
      >
        + 
      </button>
    </>
  );
}