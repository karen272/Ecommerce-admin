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
    const [isEditing, setIsEditing] = useState(false); // 👈 Nuevo estado
    const [editingProduct, setEditingProduct] = useState<Product | null>(null); // 👈 Nuevo estado
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ productId: number | null }>({ productId: null });

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

    const handleDelete = (id: number) => {
        setDeleteConfirm({ productId: id });
    };

    const confirmDelete = async () => {
        const { productId } = deleteConfirm;
        if (!productId) return;

        try {
            const { error } = await supabase.from("products").delete().eq("id", productId);
            if (error) throw error;
            setProducts(products.filter((p) => p.id !== productId));
            setToast({ message: "✅ Producto eliminado", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (err: any) {
            setToast({ message: `❌ Error al eliminar: ${err.message}`, type: "error" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setDeleteConfirm({ productId: null });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ productId: null });
    };

    // 👇 Nueva función de edición (sin prompt)
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsEditing(true);
    };

    // 👇 Nueva función para actualizar
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            const { error } = await supabase
                .from("products")
                .update({
                    name: editingProduct.name,
                    description: editingProduct.description,
                    price: editingProduct.price,
                    stock: editingProduct.stock,
                    image_url: editingProduct.image_url || null,
                })
                .eq("id", editingProduct.id);

            if (error) throw error;

            setToast({ message: "✅ Producto actualizado", type: "success" });
            setTimeout(() => setToast(null), 3000);

            fetchProducts();
            setIsEditing(false);
            setEditingProduct(null);
        } catch (err: any) {
            setToast({ message: `❌ Error al actualizar: ${err.message}`, type: "error" });
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

            setToast({ message: "✅ Producto creado exitosamente", type: "success" });
            setTimeout(() => setToast(null), 3000);

            fetchProducts();
            setIsCreating(false);
            setNewProduct({ name: "", description: "", price: 0, stock: 0, image_url: "" });
        } catch (err: any) {
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
            {/* 👇 Toast de confirmación de eliminación */}
            {deleteConfirm.productId !== null && (
                <div className="fixed inset-0 flex items-center justify-center z-[100000] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-red-600 dark:text-red-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 19c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                ¿Eliminar producto?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Esta acción no se puede deshacer. El producto será eliminado permanentemente.
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-center gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-300 dark:border-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-lg transition-colors duration-200 shadow-sm"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 👇 Toast / Alerta de éxito/error */}
            {toast && (
                <div
                    className={`fixed top-16 right-4 z-[100000] p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-in-out ${toast.type === "success"
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
                    {isCreating || isEditing ? (
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {isCreating ? "Crear Producto" : "Editar Producto"}
                        </h2>
                    ) : (
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            All Products
                        </h2>
                    )}

                    {!isCreating && !isEditing && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            + Crear Producto
                        </button>
                    )}
                </div>

                {/* Vista de lista */}
                {!isCreating && !isEditing && (
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
                                            <td className="px-4 py-3 flex gap-3">
                                                {/* Botón Editar (icono amarillo) */}
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                                                    title="Editar"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>

                                                {/* Botón Eliminar (icono rojo) */}
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
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

                {/* Vista de formulario (crear o editar) */}
                {(isCreating || isEditing) && (
                    <div className="space-y-6">
                        <form
                            onSubmit={isCreating ? handleCreate : handleUpdate}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={isCreating ? newProduct.name : editingProduct?.name || ""}
                                    onChange={(e) => {
                                        if (isCreating) {
                                            setNewProduct({ ...newProduct, name: e.target.value });
                                        } else if (editingProduct) {
                                            setEditingProduct({ ...editingProduct, name: e.target.value });
                                        }
                                    }}
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
                                    value={isCreating ? newProduct.description : editingProduct?.description || ""}
                                    onChange={(e) => {
                                        if (isCreating) {
                                            setNewProduct({ ...newProduct, description: e.target.value });
                                        } else if (editingProduct) {
                                            setEditingProduct({ ...editingProduct, description: e.target.value });
                                        }
                                    }}
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
                                    value={isCreating ? newProduct.price || "" : editingProduct?.price || ""}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        if (isCreating) {
                                            setNewProduct({ ...newProduct, price: value });
                                        } else if (editingProduct) {
                                            setEditingProduct({ ...editingProduct, price: value });
                                        }
                                    }}
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
                                    value={isCreating ? newProduct.stock || "" : editingProduct?.stock || ""}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        if (isCreating) {
                                            setNewProduct({ ...newProduct, stock: value });
                                        } else if (editingProduct) {
                                            setEditingProduct({ ...editingProduct, stock: value });
                                        }
                                    }}
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

                                                    if (isCreating) {
                                                        setNewProduct((prev) => ({ ...prev, image_url: publicUrl }));
                                                    } else if (editingProduct) {
                                                        setEditingProduct((prev) => ({ ...prev!, image_url: publicUrl }));
                                                    }
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
                                            {(isCreating ? newProduct.image_url : editingProduct?.image_url) ? (
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">Cambiar Imagen</span>
                                            ) : (
                                                <span>Subir Imagen</span>
                                            )}
                                        </label>
                                    </div>

                                    {(isCreating ? newProduct.image_url : editingProduct?.image_url) && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <img
                                                src={isCreating ? newProduct.image_url! : editingProduct!.image_url!}
                                                alt="Previsualización"
                                                className="h-12 w-12 rounded object-cover border border-gray-300 dark:border-gray-500"
                                            />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                                    {(
                                                        isCreating
                                                            ? newProduct.image_url
                                                            : editingProduct?.image_url
                                                    )?.split('/').pop()?.substring(0, 20)}...
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isCreating) {
                                                        setNewProduct(prev => ({ ...prev, image_url: "" }));
                                                    } else if (editingProduct) {
                                                        setEditingProduct(prev => ({ ...prev!, image_url: "" }));
                                                    }
                                                }}
                                                className="ml-auto text-red-600 hover:text-red-900 text-sm font-medium transition"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setIsEditing(false);
                                        setNewProduct({ name: "", description: "", price: 0, stock: 0, image_url: "" });
                                        setEditingProduct(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                >
                                    ← Volver a Productos
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    {isCreating ? "Crear Producto" : "Actualizar Producto"}
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