const API_URL = "http://localhost:8000";

// Función para cargar todos los productos
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/productos/`);
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    alert(
      "Error al cargar los productos. Verifica que el backend esté funcionando."
    );
  }
}

// Función para mostrar los productos en la tabla
function displayProducts(products) {
  const tableBody = document.getElementById("productsTableBody");
  tableBody.innerHTML = "";

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${product.id_producto || "N/A"}</td>
            <td>${product.nombre}</td>
            <td>${product.descripcion}</td>
            <td>$${product.precio.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="openEditModal('${
                  product._id
                }', '${product.nombre}', '${product.descripcion}', ${
      product.precio
    }, ${product.stock})">
                    Editar
                </button>
                <button class="delete-btn" onclick="deleteProduct('${
                  product._id
                }')">
                    Eliminar
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// Función para agregar un nuevo producto
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const productData = {
    nombre: document.getElementById("name").value,
    descripcion: document.getElementById("description").value,
    precio: parseFloat(document.getElementById("price").value),
    stock: parseInt(document.getElementById("stock").value),
  };

  try {
    const response = await fetch(`${API_URL}/productos/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      document.getElementById("productForm").reset();
      loadProducts();
      alert("Producto agregado exitosamente!");
    } else {
      alert("Error al agregar el producto");
    }
  } catch (error) {
    console.error("Error al agregar producto:", error);
    alert("Error al agregar el producto. Verifica la conexión con el backend.");
  }
});

// Función para buscar productos
document.getElementById("searchInput").addEventListener("input", async (e) => {
  const searchTerm = e.target.value.trim().toLowerCase();

  try {
    const response = await fetch(`${API_URL}/productos/`);
    const products = await response.json();

    if (searchTerm === "") {
      displayProducts(products);
    } else {
      const filteredProducts = products.filter(
        (product) =>
          product.nombre.toLowerCase().includes(searchTerm) ||
          product.descripcion.toLowerCase().includes(searchTerm)
      );
      displayProducts(filteredProducts);
    }
  } catch (error) {
    console.error("Error al buscar productos:", error);
  }
});
//funcion para eliminar
async function deleteProduct(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    try {
      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadProducts(); // Recargar la lista después de eliminar
        alert("Producto eliminado exitosamente");
      } else {
        alert("Error al eliminar el producto");
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  }
}
function openEditModal(id, nombre, descripcion, precio, stock) {
  document.getElementById("editId").value = id;
  document.getElementById("editName").value = nombre;
  document.getElementById("editDescription").value = descripcion;
  document.getElementById("editPrice").value = precio;
  document.getElementById("editStock").value = stock;
  document.getElementById("editModal").style.display = "block";
}

// Cerrar modal
document.querySelector(".close").onclick = function () {
  document.getElementById("editModal").style.display = "none";
};

window.onclick = function (event) {
  if (event.target == document.getElementById("editModal")) {
    document.getElementById("editModal").style.display = "none";
  }
};

// Manejar la actualización del producto
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const productData = {
    nombre: document.getElementById("editName").value,
    descripcion: document.getElementById("editDescription").value,
    precio: parseFloat(document.getElementById("editPrice").value),
    stock: parseInt(document.getElementById("editStock").value),
  };

  try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      document.getElementById("editModal").style.display = "none";
      loadProducts();
      alert("Producto actualizado exitosamente");
    } else {
      alert("Error al actualizar el producto");
    }
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    alert("Error al actualizar el producto");
  }
});
// Cargar productos al iniciar la página
loadProducts();
