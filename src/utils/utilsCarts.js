export function sumarProductosIguales(products) {
    const result = [];
  
    products.forEach((product) => {
      const existingProduct = result.find((p) => p.id === product.id._id);
  
      if (existingProduct) {
        existingProduct.quantity += product.quantity;
        existingProduct.subtotal += product.quantity * product.id.price;
      } else {
        result.push({
          id: product.id._id,
          title: product.id.title,
          price: product.id.price,
          quantity: product.quantity,
          subtotal: product.quantity * product.id.price,
        });
      }
    });
    return result;
  }

  export function calcularTotal(products) {
    let total = 0;
    products.forEach((product) => {
      total += product.subtotal;
    });
    return total;
  }
  export function contarProductosEnCarrito(products) {
    let totalProductos = 0;
  
    products.forEach((product) => {
      totalProductos += product.quantity;
    });
  
    return totalProductos;
  }