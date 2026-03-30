import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDoc, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Vendor, Product, Order } from '../types';
import { ShoppingCart, MapPin, Package, X, CheckCircle, ArrowRight, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const Storefront: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        // 1. Find vendor by slug
        const slugDoc = await getDoc(doc(db, 'slugs', slug));
        if (!slugDoc.exists()) {
          setLoading(false);
          return;
        }
        const vendorId = slugDoc.data().vendorId;
        const vendorDoc = await getDoc(doc(db, 'vendors', vendorId));
        if (vendorDoc.exists()) {
          const vendorData = vendorDoc.data() as Vendor;
          setVendor(vendorData);

          // 2. Fetch products
          const productsQuery = query(collection(db, 'products'), where('vendorId', '==', vendorId));
          const productsSnapshot = await getDocs(productsQuery);
          setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `slugs/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    const orderData = {
      vendorId: vendor.uid,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total,
      status: 'pending',
      fakeProbability: Math.random(), // Simulated risk score
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      setCheckoutStep('success');
      setCart([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Store Not Found</h1>
        <p className="text-gray-600 mb-8">The store you are looking for does not exist or has been moved.</p>
        <a href="/" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors">
          Go Back Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden border border-gray-100">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.storeName} className="w-full h-full object-cover" />
              ) : (
                <Store className="text-orange-600" size={24} />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{vendor.storeName}</h1>
              {vendor.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span>{vendor.location}</span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero / Banner */}
      <section className="bg-orange-600 py-16 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Welcome to {vendor.storeName}
          </motion.h2>
          <p className="text-orange-100 text-lg">Discover our curated collection of premium products.</p>
        </div>
      </section>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Our Products</h3>
          <p className="text-gray-500">{products.length} Items</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <Package className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={48} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{product.name}</h4>
                  <p className="text-gray-500 text-sm line-clamp-1 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="bg-gray-900 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="md:w-1/2 bg-gray-50 relative">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-gray-900 md:hidden"
                >
                  <X size={20} />
                </button>
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={80} />
                  </div>
                )}
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                    <span className="text-3xl font-bold text-orange-600">${selectedProduct.price.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors hidden md:block"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 mb-8">
                  <p className="text-gray-600 leading-relaxed">{selectedProduct.description || 'No description available.'}</p>
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <CheckCircle size={16} className="text-green-500" />
                      <span>In Stock: {selectedProduct.stock} units</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle size={16} className="text-green-500" />
                      <span>Fast Delivery Available</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart size={20} />
                  <span>Your Cart</span>
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-gray-900">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {checkoutStep === 'cart' && (
                  cart.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingCart className="mx-auto text-gray-200 mb-4" size={64} />
                      <p className="text-gray-500">Your cart is empty.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} x {item.quantity}</p>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-xs text-red-500 hover:underline mt-1"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="font-bold text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {checkoutStep === 'details' && (
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                    <h4 className="font-bold text-lg">Customer Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" required
                        value={customerInfo.name}
                        onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" required
                        value={customerInfo.email}
                        onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">Order Summary</p>
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>Total Amount</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </form>
                )}

                {checkoutStep === 'success' && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h4>
                    <p className="text-gray-600 mb-8">Thank you for your order. The vendor will process it soon.</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
              </div>

              {cart.length > 0 && checkoutStep !== 'success' && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  {checkoutStep === 'cart' ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => setCheckoutStep('details')}
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Checkout</span>
                        <ArrowRight size={20} />
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setCheckoutStep('cart')}
                        className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        form="checkout-form"
                        type="submit"
                        className="flex-[2] bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
                      >
                        Place Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Storefront;
