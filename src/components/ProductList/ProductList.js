import React, { useEffect, useState } from 'react';
import './ProductList.css'

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    image: null
  });
  const [formError, setFormError] = useState('');
  const handleAddProduct = () => {
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('category', formData.category);
      formPayload.append('description', formData.description);
      formPayload.append('price', formData.price);
      if (formData.image) {
        formPayload.append('image', formData.image);
      }
  
      const response = await fetch('https://rugas-orm-client.onrender.com/api/products', {
        method: 'POST',
        credentials: 'include',
        body: formPayload
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }
  
      const newProduct = await response.json();
      
      const formattedProduct = {
        ...newProduct,
        image: newProduct.image ? {
          contentType: newProduct.image.contentType,
          data: newProduct.image.data
        } : null
      };
  
      setProducts([...products, formattedProduct]);
      setShowForm(false);
      setFormData({
        name: '',
        category: '',
        description: '',
        price: '',
        image: null
      });
      setFormError('');
    } catch (err) {
      setFormError(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://rugas-orm-client.onrender.com/api/products', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        throw new Error('Please login to view products');
      }
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list">
      <div className="header-row">
        <h2>Products</h2>
        <button onClick={handleAddProduct} className="add-product-btn">
          Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <h3>Add New Product</h3>
          {formError && <div className="error">{formError}</div>}
          
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            Category:
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Price:
            <input
              type="number"
              name="price"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>

          <div className="form-buttons">
            <button type="submit">Create Product</button>
            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="grid">
      {products.map(product => (
          <div key={product._id} className="card">
            {product.image?.data && (
              <img
                src={`data:${product.image.contentType};base64,${product.image.data}`}
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.style.display = 'none'; 
                }}
              />
            )}

            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;