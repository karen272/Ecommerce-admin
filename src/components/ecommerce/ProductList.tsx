// src/components/ecommerce/ProductList.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/superbaseClient";

type Product = {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
    image_url?: string;
};

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null); // 👈 Nuevo estado para toast

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("id", { ascending: true });

            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            setError(err.message || "Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

        try {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
            setProducts(products.filter((p) => p.id !== id));
        } catch (err: any) {
            setToast({ message: `❌ Error al eliminar: ${err.message}`, type: "error" });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleEdit = async (product: Product) => {
        const newName = prompt("Nombre:", product.name);
        if (newName === null) return;

        const newPrice = prompt("Precio:", product.price.toString());
        if (newPrice === null) return;

        const newStock = prompt("Stock:", product.stock.toString());
        if (newStock === null) return;

        try {
            const { error } = await supabase
                .from("products")
                .update({
                    name: newName,
                    price: parseFloat(newPrice) || 0,
                    stock: parseInt(newStock) || 0,
                })
                .eq("id", product.id);

            if (error) throw error;

            setProducts(
                products.map((p) =>
                    p.id === product.id
                        ? { ...p, name: newName, price: parseFloat(newPrice), stock: parseInt(newStock) }
                        : p
                )
            );
        } catch (err: any) {
            setToast({ message: `❌ Error al editar: ${err.message}`, type: "error" });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        image_url: "",
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from("products").insert([
                {
                    name: newProduct.name,
                    description: newProduct.description,
                    price: newProduct.price,
                    stock: newProduct.stock,
                    image_url: newProduct.image_url || null,
                },
            ]);

            if (error) throw error;

            // ✅ Mostrar toast de éxito
            setToast({ message: "✅ Producto creado exitosamente", type: "success" });
            setTimeout(() => setToast(null), 3000);

            // Resetear
            fetchProducts();
            setIsCreating(false);
            setNewProduct({ name: "", description: "", price: 0, stock: 0, image_url: "" });
        } catch (err: any) {
            // ❌ Mostrar toast de error
            setToast({ message: `❌ Error al crear producto: ${err.message}`, type: "error" });
            setTimeout(() => setToast(null), 3000);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) {
        return <div className="p-6">Cargando productos...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            {/* 👇 Toast / Alerta */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-[100000] p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-in-out ${toast.type === "success"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {toast.type === "success" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-4 mb-4">
                    {isCreating ? (
                        <button
                            onClick={() => setIsCreating(false)}
                            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium flex items-center gap-1"
                        >
                            ← Volver a Productos
                        </button>
                    ) : (
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            All Products
                        </h2>
                    )}

                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            + Crear Producto
                        </button>
                    )}
                </div>

                {/* Vista de lista */}
                {!isCreating && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Producto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Precio</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {product.image_url && (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="w-10 h-10 rounded mr-3 object-cover"
                                                        />
                                                    )}
                                                    <span className="text-gray-800 dark:text-gray-200">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{product.description}</td>
                                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200">${product.price.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 10
                                                        ? "bg-green-100 text-green-800"
                                                        : product.stock > 0
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 space-x-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                                            No hay productos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Vista de formulario */}
                {isCreating && (
                    <div className="space-y-6">
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Precio *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProduct.price || ""}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Stock *
                                </label>
                                <input
                                    type="number"
                                    value={newProduct.stock || ""}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Imagen (opcional)
                                </label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                try {
                                                    const { data, error } = await supabase.storage
                                                        .from("productos")
                                                        .upload(`product-${Date.now()}-${file.name}`, file, {
                                                            cacheControl: "3600",
                                                            upsert: false,
                                                        });

                                                    if (error) throw error;

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from("productos")
                                                        .getPublicUrl(data.path);

                                                    setNewProduct((prev) => ({
                                                        ...prev,
                                                        image_url: publicUrl,
                                                    }));
                                                } catch (err: any) {
                                                    setToast({ message: `❌ Error al subir imagen: ${err.message}`, type: "error" });
                                                    setTimeout(() => setToast(null), 3000);
                                                }
                                            }}
                                            id="image-upload"
                                            className="hidden"
                                        />

                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            {newProduct.image_url ? (
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">Cambiar Imagen</span>
                                            ) : (
                                                <span>Subir Imagen</span>
                                            )}
                                        </label>
                                    </div>

                                    {newProduct.image_url && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <img
                                                src={newProduct.image_url}
                                                alt="Previsualización"
                                                className="h-12 w-12 rounded object-cover border border-gray-300 dark:border-gray-500"
                                            />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                                    {newProduct.image_url.split('/').pop()?.substring(0, 20)}...
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setNewProduct(prev => ({ ...prev, image_url: "" }))}
                                                className="ml-auto text-red-600 hover:text-red-900 text-sm font-medium transition"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    Crear Producto
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProductList;