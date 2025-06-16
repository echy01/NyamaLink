// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   Alert,
//   RefreshControl,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';

// export default function CustomerDashboard({ userName }) {
//   const [activeTab, setActiveTab] = useState('beef');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [meat, setMeat] = useState([]);
//   const [filteredMeat, setFilteredMeat] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [bottomTab, setBottomTab] = useState('browse');
//   const router = useRouter();

//   const meatCategories = ['beef', 'goat', 'chicken', 'pork', 'lamb'];

//   useEffect(() => {
//     loadMeatData();
//     loadCartData();
//     loadOrderHistory();
//   }, []);

//   useEffect(() => {
//     filterMeat();
//   }, [searchQuery, activeTab, meat]);

//   const loadMeatData = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await fetch('http://192.168.100.48:5000/api/meat/available', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setMeat(data.meat || []);
//       }
//     } catch (error) {
//       console.error('Error loading meat:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCartData = async () => {
//     try {
//       const cartData = await AsyncStorage.getItem('cart');
//       if (cartData) {
//         setCart(JSON.parse(cartData));
//       }
//     } catch (error) {
//       console.error('Error loading cart:', error);
//     }
//   };

//   const loadOrderHistory = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await fetch('http://192.168.100.48:5000/api/orders/customer', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setOrders(data.orders || []);
//       }
//     } catch (error) {
//       console.error('Error loading orders:', error);
//     }
//   };

//   const filterMeat = () => {
//     let filtered = meat.filter(item => 
//       item.category?.toLowerCase() === activeTab.toLowerCase()
//     );
    
//     if (searchQuery) {
//       filtered = filtered.filter(item =>
//         item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.butchery?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
    
//     setFilteredMeat(filtered);
//   };

//   const addToCart = async (item) => {
//     try {
//       const existingItem = cart.find(cartItem => cartItem._id === item._id);
//       let updatedCart;
      
//       if (existingItem) {
//         updatedCart = cart.map(cartItem =>
//           cartItem._id === item._id
//             ? { ...cartItem, quantity: cartItem.quantity + 1 }
//             : cartItem
//         );
//       } else {
//         updatedCart = [...cart, { ...item, quantity: 1 }];
//       }
      
//       setCart(updatedCart);
//       await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
//       Alert.alert('Success', 'Item added to cart!');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add item to cart');
//     }
//   };

//   const removeFromCart = async (itemId) => {
//     try {
//       const updatedCart = cart.filter(item => item._id !== itemId);
//       setCart(updatedCart);
//       await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
//     } catch (error) {
//       Alert.alert('Error', 'Failed to remove item from cart');
//     }
//   };

//   const updateCartQuantity = async (itemId, newQuantity) => {
//     try {
//       if (newQuantity <= 0) {
//         removeFromCart(itemId);
//         return;
//       }
      
//       const updatedCart = cart.map(item =>
//         item._id === itemId ? { ...item, quantity: newQuantity } : item
//       );
//       setCart(updatedCart);
//       await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update quantity');
//     }
//   };

//   const placeOrder = async () => {
//     if (cart.length === 0) {
//       Alert.alert('Error', 'Your cart is empty');
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await fetch('http://192.168.100.48:5000/api/orders/place', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ items: cart }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         Alert.alert('Success', 'Order placed successfully!');
//         setCart([]);
//         await AsyncStorage.removeItem('cart');
//         loadOrderHistory();
//         setBottomTab('orders');
//       } else {
//         Alert.alert('Error', data.message || 'Failed to place order');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to place order');
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.multiRemove(['token', 'cart']);
//       router.replace('/loginscreen');
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadMeatData();
//     setRefreshing(false);
//   };

//   const getTotalPrice = () => {
//     return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
//   };

//   const renderMeatItem = ({ item }) => (
//     <View style={styles.meatItem}>
//       <View style={styles.meatInfo}>
//         <Text style={styles.meatName}>{item.name}</Text>
//         <Text style={styles.butcheryName}>{item.butchery}</Text>
//         <Text style={styles.meatPrice}>KES {item.price}/kg</Text>
//         <Text style={styles.stockInfo}>Stock: {item.stock}kg</Text>
//       </View>
//       <TouchableOpacity
//         style={styles.addButton}
//         onPress={() => addToCart(item)}
//         disabled={item.stock <= 0}
//       >
//         <Text style={styles.addButtonText}>
//           {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderCartItem = ({ item }) => (
//     <View style={styles.cartItem}>
//       <View style={styles.cartInfo}>
//         <Text style={styles.cartItemName}>{item.name}</Text>
//         <Text style={styles.cartItemPrice}>KES {item.price}/kg</Text>
//       </View>
//       <View style={styles.quantityControls}>
//         <TouchableOpacity
//           style={styles.quantityButton}
//           onPress={() => updateCartQuantity(item._id, item.quantity - 1)}
//         >
//           <Text style={styles.quantityButtonText}>-</Text>
//         </TouchableOpacity>
//         <Text style={styles.quantityText}>{item.quantity}</Text>
//         <TouchableOpacity
//           style={styles.quantityButton}
//           onPress={() => updateCartQuantity(item._id, item.quantity + 1)}
//         >
//           <Text style={styles.quantityButtonText}>+</Text>
//         </TouchableOpacity>
//       </View>
//       <TouchableOpacity
//         style={styles.removeButton}
//         onPress={() => removeFromCart(item._id)}
//       >
//         <Text style={styles.removeButtonText}>Remove</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderOrderItem = ({ item }) => (
//     <View style={styles.orderItem}>
//       <Text style={styles.orderDate}>
//         {new Date(item.createdAt).toLocaleDateString()}
//       </Text>
//       <Text style={styles.orderStatus}>Status: {item.status}</Text>
//       <Text style={styles.orderTotal}>Total: KES {item.total}</Text>
//       <Text style={styles.orderItems}>
//         Items: {item.items?.length || 0}
//       </Text>
//     </View>
//   );

//   if (bottomTab === 'browse') {
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
//           <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
//             <Text style={styles.logoutText}>Logout</Text>
//           </TouchableOpacity>
//         </View>

//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search meat or butchery..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />

//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
//           {meatCategories.map((category) => (
//             <TouchableOpacity
//               key={category}
//               style={[styles.tab, activeTab === category && styles.activeTab]}
//               onPress={() => setActiveTab(category)}
//             >
//               <Text style={[styles.tabText, activeTab === category && styles.activeTabText]}>
//                 {category.charAt(0).toUpperCase() + category.slice(1)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         <FlatList
//           data={filteredMeat}
//           renderItem={renderMeatItem}
//           keyExtractor={(item) => item._id}
//           style={styles.meatList}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No meat available in this category</Text>
//           }
//         />

//         <View style={styles.bottomNavigation}>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'browse' && styles.activeNavItem]}
//             onPress={() => setBottomTab('browse')}
//           >
//             <Text style={[styles.navText, bottomTab === 'browse' && styles.activeNavText]}>
//               Browse
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'cart' && styles.activeNavItem]}
//             onPress={() => setBottomTab('cart')}
//           >
//             <Text style={[styles.navText, bottomTab === 'cart' && styles.activeNavText]}>
//               Cart ({cart.length})
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'orders' && styles.activeNavItem]}
//             onPress={() => setBottomTab('orders')}
//           >
//             <Text style={[styles.navText, bottomTab === 'orders' && styles.activeNavText]}>
//               Orders
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'profile' && styles.activeNavItem]}
//             onPress={() => setBottomTab('profile')}
//           >
//             <Text style={[styles.navText, bottomTab === 'profile' && styles.activeNavText]}>
//               Profile
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   if (bottomTab === 'cart') {
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Shopping Cart</Text>
//         </View>

//         <FlatList
//           data={cart}
//           renderItem={renderCartItem}
//           keyExtractor={(item) => item._id}
//           style={styles.cartList}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>Your cart is empty</Text>
//           }
//         />

//         {cart.length > 0 && (
//           <View style={styles.cartFooter}>
//             <Text style={styles.totalText}>Total: KES {getTotalPrice()}</Text>
//             <TouchableOpacity style={styles.checkoutButton} onPress={placeOrder}>
//               <Text style={styles.checkoutButtonText}>Place Order</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <View style={styles.bottomNavigation}>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'browse' && styles.activeNavItem]}
//             onPress={() => setBottomTab('browse')}
//           >
//             <Text style={[styles.navText, bottomTab === 'browse' && styles.activeNavText]}>
//               Browse
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'cart' && styles.activeNavItem]}
//             onPress={() => setBottomTab('cart')}
//           >
//             <Text style={[styles.navText, bottomTab === 'cart' && styles.activeNavText]}>
//               Cart ({cart.length})
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'orders' && styles.activeNavItem]}
//             onPress={() => setBottomTab('orders')}
//           >
//             <Text style={[styles.navText, bottomTab === 'orders' && styles.activeNavText]}>
//               Orders
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'profile' && styles.activeNavItem]}
//             onPress={() => setBottomTab('profile')}
//           >
//             <Text style={[styles.navText, bottomTab === 'profile' && styles.activeNavText]}>
//               Profile
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   if (bottomTab === 'orders') {
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Order History</Text>
//         </View>

//         <FlatList
//           data={orders}
//           renderItem={renderOrderItem}
//           keyExtractor={(item) => item._id}
//           style={styles.ordersList}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No orders yet</Text>
//           }
//         />

//         <View style={styles.bottomNavigation}>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'browse' && styles.activeNavItem]}
//             onPress={() => setBottomTab('browse')}
//           >
//             <Text style={[styles.navText, bottomTab === 'browse' && styles.activeNavText]}>
//               Browse
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'cart' && styles.activeNavItem]}
//             onPress={() => setBottomTab('cart')}
//           >
//             <Text style={[styles.navText, bottomTab === 'cart' && styles.activeNavText]}>
//               Cart ({cart.length})
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'orders' && styles.activeNavItem]}
//             onPress={() => setBottomTab('orders')}
//           >
//             <Text style={[styles.navText, bottomTab === 'orders' && styles.activeNavText]}>
//               Orders
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.navItem, bottomTab === 'profile' && styles.activeNavItem]}
//             onPress={() => setBottomTab('profile')}
//           >
//             <Text style={[styles.navText, bottomTab === 'profile' && styles.activeNavText]}>
//               Profile
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   // Profile tab
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Profile</Text>
//       </View>

//       <View style={styles.profileContainer}>
//         <Text style={styles.profileName}>{userName}</Text>
//         <Text style={styles.profileRole}>Customer</Text>
        
//         <TouchableOpacity style={styles.profileButton}>
//           <Text style={styles.profileButtonText}>Edit Profile</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.profileButton}>
//           <Text style={styles.profileButtonText}>Delivery Addresses</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.profileButton}>
//           <Text style={styles.profileButtonText}>Payment Methods</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <Text style={styles.logoutButtonText}>Logout</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.bottomNavigation}>
//         <TouchableOpacity
//           style={[styles.navItem, bottomTab === 'browse' && styles.activeNavItem]}
//           onPress={() => setBottomTab('browse')}
//         >
//           <Text style={[styles.navText, bottomTab === 'browse' && styles.activeNavText]}>
//             Browse
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.navItem, bottomTab === 'cart' && styles.activeNavItem]}
//           onPress={() => setBottomTab('cart')}
//         >
//           <Text style={[styles.navText, bottomTab === 'cart' && styles.activeNavText]}>
//             Cart ({cart.length})
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.navItem, bottomTab === 'orders' && styles.activeNavItem]}
//           onPress={() => setBottomTab('orders')}
//         >
//           <Text style={[styles.navText, bottomTab === 'orders' && styles.activeNavText]}>
//             Orders
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.navItem, bottomTab === 'profile' && styles.activeNavItem]}
//           onPress={() => setBottomTab('profile')}
//         >
//           <Text style={[styles.navText, bottomTab === 'profile' && styles.activeNavText]}>
//             Profile
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#cc0000',
//     paddingTop: 50,
//   },
//   welcomeText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   logoutButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 5,
//   },
//   logoutText: {
//     color: '#fff',
//     fontSize: 14,
//   },
//   searchInput: {
//     margin: 16,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#cc0000',
//     borderRadius: 8,
//     backgroundColor: '#fff',
//   },
//   tabContainer: {
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   tab: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     marginRight: 12,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#cc0000',
//     backgroundColor: '#fff',
//   },
//   activeTab: {
//     backgroundColor: '#cc0000',
//   },
//   tabText: {
//     color: '#cc0000',
//     fontWeight: '500',
//   },
//   activeTabText: {
//     color: '#fff',
//   },
//   meatList: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   meatItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     marginBottom: 12,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#cc0000',
//   },
//   meatInfo: {
//     flex: 1,
//   },
//   meatName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   butcheryName: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   meatPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#cc0000',
//     marginTop: 4,
//   },
//   stockInfo: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 2,
//   },
//   addButton: {
//     backgroundColor: '#cc0000',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   cartList: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   cartItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     marginBottom: 12,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//   },
//   cartInfo: {
//     flex: 1,
//   },
//   cartItemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   cartItemPrice: {
//     fontSize: 14,
//     color: '#cc0000',
//     marginTop: 2,
//   },
//   quantityControls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 12,
//   },
//   quantityButton: {
//     backgroundColor: '#cc0000',
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   quantityButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   quantityText: {
//     marginHorizontal: 12,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   removeButton: {
//     backgroundColor: '#ff4444',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 4,
//   },
//   removeButtonText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   cartFooter: {
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     backgroundColor: '#fff',
//   },
//   totalText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   checkoutButton: {
//     backgroundColor: '#cc0000',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   checkoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   ordersList: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   orderItem: {
//     padding: 16,
//     marginBottom: 12,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#cc0000',
//   },
//   orderDate: {
//     fontSize: 14,
//     color: '#666',
//   },
//   orderStatus: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 4,
//   },
//   orderTotal: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#cc0000',
//     marginTop: 4,
//   },
//   orderItems: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   profileContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   profileName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   profileRole: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 32,
//   },
//   profileButton: {
//     backgroundColor: '#f8f8f8',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#cc0000',
//   },
//   profileButtonText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   logoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   bottomNavigation: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingVertical: 8,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   activeNavItem: {
//     backgroundColor: 'rgba(204, 0, 0, 0.1)',
//   },
//   navText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   activeNavText: {
//     color: '#cc0000',
//     fontWeight: 'bold',
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 16,
//     marginTop: 32,
//   },
// });



// customer.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   RefreshControl,
//   ScrollView
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../api';
// import styles from './styles';

// const meatCategories = ['beef', 'goat', 'chicken', 'pork', 'lamb'];

// export default function CustomerDashboard({ userName }) {
//   const [activeTab, setActiveTab] = useState('beef');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [meat, setMeat] = useState([]);
//   const [filteredMeat, setFilteredMeat] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeBottomTab, setActiveBottomTab] = useState('browse');
//   const router = useRouter();

//   useEffect(() => {
//     loadData();
//   }, []);

//   useEffect(() => {
//     filterMeat();
//   }, [searchQuery, activeTab, meat]);

//   const loadData = async () => {
//     try {
//       setRefreshing(true);
//       await Promise.all([loadMeatData(), loadCartData(), loadOrderHistory()]);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load data');
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const loadMeatData = async () => {
//     try {
//       const response = await api.getAvailableMeat();
//       setMeat(response.data.meat || []);
//     } catch (error) {
//       console.error('Error loading meat:', error);
//       throw error;
//     }
//   };

//   const loadCartData = async () => {
//     try {
//       const cartData = await AsyncStorage.getItem('cart');
//       if (cartData) {
//         setCart(JSON.parse(cartData));
//       }
//     } catch (error) {
//       console.error('Error loading cart:', error);
//       throw error;
//     }
//   };

//   const loadOrderHistory = async () => {
//     try {
//       const response = await api.getCustomerOrders();
//       setOrders(response.data.orders || []);
//     } catch (error) {
//       console.error('Error loading orders:', error);
//       throw error;
//     }
//   };

//   const filterMeat = () => {
//     let filtered = meat.filter(item => 
//       item.category?.toLowerCase() === activeTab.toLowerCase()
//     );
    
//     if (searchQuery) {
//       filtered = filtered.filter(item =>
//         item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.butchery?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
    
//     setFilteredMeat(filtered);
//   };

//   const handleAddToCart = async (item) => {
//     try {
//       const existingItem = cart.find(cartItem => cartItem._id === item._id);
//       let updatedCart;
      
//       if (existingItem) {
//         updatedCart = cart.map(cartItem =>
//           cartItem._id === item._id
//             ? { ...cartItem, quantity: cartItem.quantity + 1 }
//             : cartItem
//         );
//       } else {
//         updatedCart = [...cart, { ...item, quantity: 1 }];
//       }
      
//       setCart(updatedCart);
//       await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
//       Alert.alert('Success', 'Item added to cart!');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add item to cart');
//     }
//   };

//   const handleRemoveFromCart = async (itemId) => {
//     try {
//       const updatedCart = cart.filter(item => item._id !== itemId);
//       setCart(updatedCart);
//       await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
//     } catch (error) {
//       Alert.alert('Error', 'Failed to remove item from cart');
//     }
//   };

//   const handleUpdateCartQuantity = async (itemId, newQuantity) => {
//     try {
//       if (newQuantity <= 0) {
//         handleRemoveFromCart(itemId);
//         return;
//       }
      
//       const updatedCart = cart.map(item =>
//         item._id === itemId ? { ...item, quantity: newQuantity } : item
//       );
//       setCart(updatedCart);
//       await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update quantity');
//     }
//   };

//   const handlePlaceOrder = async () => {
//     if (cart.length === 0) {
//       Alert.alert('Error', 'Your cart is empty');
//       return;
//     }

//     try {
//       const response = await api.placeOrder(cart);
//       Alert.alert('Success', 'Order placed successfully!');
//       setCart([]);
//       await AsyncStorage.removeItem('cart');
//       loadOrderHistory();
//       setActiveBottomTab('orders');
//     } catch (error) {
//       Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.multiRemove(['token', 'cart']);
//       router.replace('/login');
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   const renderMeatItem = ({ item }) => (
//     <View style={[styles.card, styles.cardHighlight]}>
//       <View style={styles.itemRow}>
//         <View style={{ flex: 1 }}>
//           <Text style={[styles.text, styles.textBold]}>{item.name}</Text>
//           <Text style={styles.textLight}>{item.butchery}</Text>
//           <Text style={[styles.text, { color: styles.colors.primary }]}>
//             KES {item.price}/kg
//           </Text>
//           <Text style={styles.textLight}>Stock: {item.stock}kg</Text>
//         </View>
//         <TouchableOpacity
//           style={[styles.button, styles.buttonSmall, item.stock <= 0 && { opacity: 0.5 }]}
//           onPress={() => handleAddToCart(item)}
//           disabled={item.stock <= 0}
//         >
//           <Text style={styles.buttonText}>
//             {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const renderCartItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.itemRow}>
//         <View style={{ flex: 1 }}>
//           <Text style={[styles.text, styles.textBold]}>{item.name}</Text>
//           <Text style={[styles.text, { color: styles.colors.primary }]}>
//             KES {item.price}/kg
//           </Text>
//         </View>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TouchableOpacity
//             style={[styles.button, styles.buttonSmall, { marginRight: 8 }]}
//             onPress={() => handleUpdateCartQuantity(item._id, item.quantity - 1)}
//           >
//             <Text style={styles.buttonText}>-</Text>
//           </TouchableOpacity>
//           <Text style={[styles.text, { marginHorizontal: 8 }]}>{item.quantity}</Text>
//           <TouchableOpacity
//             style={[styles.button, styles.buttonSmall, { marginRight: 8 }]}
//             onPress={() => handleUpdateCartQuantity(item._id, item.quantity + 1)}
//           >
//             <Text style={styles.buttonText}>+</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.button, styles.buttonSmall, styles.buttonDanger]}
//             onPress={() => handleRemoveFromCart(item._id)}
//           >
//             <Text style={styles.buttonText}>Remove</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   const renderOrderItem = ({ item }) => (
//     <View style={[styles.card, styles.cardHighlight]}>
//       <Text style={styles.textLight}>
//         {new Date(item.createdAt).toLocaleDateString()}
//       </Text>
//       <Text style={[styles.text, styles.textBold]}>Status: {item.status}</Text>
//       <Text style={[styles.text, { color: styles.colors.primary }]}>
//         Total: KES {item.total}
//       </Text>
//       <Text style={styles.textLight}>Items: {item.items?.length || 0}</Text>
//     </View>
//   );

//   const renderProfile = () => (
//     <View style={styles.content}>
//       <Text style={[styles.text, styles.textBold, { textAlign: 'center', marginBottom: 16 }]}>
//         {userName}
//       </Text>
//       <Text style={[styles.textLight, { textAlign: 'center', marginBottom: 24 }]}>
//         Customer
//       </Text>
      
//       <TouchableOpacity style={[styles.button, { marginBottom: 12 }]}>
//         <Text style={styles.buttonText}>Edit Profile</Text>
//       </TouchableOpacity>
      
//       <TouchableOpacity style={[styles.button, { marginBottom: 12 }]}>
//         <Text style={styles.buttonText}>Delivery Addresses</Text>
//       </TouchableOpacity>
      
//       <TouchableOpacity style={[styles.button, { marginBottom: 12 }]}>
//         <Text style={styles.buttonText}>Payment Methods</Text>
//       </TouchableOpacity>
      
//       <TouchableOpacity 
//         style={[styles.button, styles.buttonOutline]} 
//         onPress={handleLogout}
//       >
//         <Text style={styles.buttonOutlineText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const getTotalPrice = () => {
//     return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>
//           {activeBottomTab === 'browse' ? `Welcome, ${userName}!` : 
//            activeBottomTab === 'cart' ? 'Shopping Cart' :
//            activeBottomTab === 'orders' ? 'Order History' : 'Profile'}
//         </Text>
//         {activeBottomTab === 'browse' && (
//           <TouchableOpacity onPress={handleLogout}>
//             <Text style={{ color: styles.colors.white }}>Logout</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {activeBottomTab === 'browse' && (
//         <>
//           <TextInput
//             style={styles.input}
//             placeholder="Search meat or butchery..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />

//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false} 
//             style={styles.tabContainer}
//           >
//             {meatCategories.map((category) => (
//               <TouchableOpacity
//                 key={category}
//                 style={[styles.tab, activeTab === category && styles.tabActive]}
//                 onPress={() => setActiveTab(category)}
//               >
//                 <Text style={[styles.tabText, activeTab === category && styles.tabTextActive]}>
//                   {category.charAt(0).toUpperCase() + category.slice(1)}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           <FlatList
//             data={filteredMeat}
//             renderItem={renderMeatItem}
//             keyExtractor={(item) => item._id}
//             contentContainerStyle={styles.content}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={loadData} />
//             }
//             ListEmptyComponent={
//               <Text style={styles.emptyState}>No meat available in this category</Text>
//             }
//           />
//         </>
//       )}

//       {activeBottomTab === 'cart' && (
//         <>
//           <FlatList
//             data={cart}
//             renderItem={renderCartItem}
//             keyExtractor={(item) => item._id}
//             contentContainerStyle={styles.content}
//             ListEmptyComponent={
//               <Text style={styles.emptyState}>Your cart is empty</Text>
//             }
//           />

//           {cart.length > 0 && (
//             <View style={{ padding: 16 }}>
//               <Text style={[styles.text, styles.textBold, { textAlign: 'center', marginBottom: 12 }]}>
//                 Total: KES {getTotalPrice()}
//               </Text>
//               <TouchableOpacity 
//                 style={styles.button} 
//                 onPress={handlePlaceOrder}
//               >
//                 <Text style={styles.buttonText}>Place Order</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </>
//       )}

//       {activeBottomTab === 'orders' && (
//         <FlatList
//           data={orders}
//           renderItem={renderOrderItem}
//           keyExtractor={(item) => item._id}
//           contentContainerStyle={styles.content}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={loadData} />
//           }
//           ListEmptyComponent={
//             <Text style={styles.emptyState}>No orders yet</Text>
//           }
//         />
//       )}

//       {activeBottomTab === 'profile' && renderProfile()}

//       <View style={styles.bottomNavigation}>
//         {['browse', 'cart', 'orders', 'profile'].map((tab) => (
//           <TouchableOpacity
//             key={tab}
//             style={[
//               styles.navItem, 
//               activeBottomTab === tab && styles.activeNavItem
//             ]}
//             onPress={() => setActiveBottomTab(tab)}
//           >
//             <Text style={[
//               styles.navText, 
//               activeBottomTab === tab && styles.activeNavText
//             ]}>
//               {tab === 'cart' ? `Cart (${cart.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// }



// customer.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import styles from './styles';

const meatCategories = ['beef', 'goat', 'chicken', 'pork', 'lamb'];
const bottomTabs = [
  { id: 'browse', label: 'Browse' },
  { id: 'cart', label: 'Cart' },
  { id: 'orders', label: 'Orders' },
  { id: 'profile', label: 'Profile' },
];

export default function CustomerDashboard({ userName }) {
  const [activeTab, setActiveTab] = useState('beef');
  const [searchQuery, setSearchQuery] = useState('');
  const [meat, setMeat] = useState([]);
  const [filteredMeat, setFilteredMeat] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState('browse');
  const router = useRouter();

  // Load all initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([loadMeatData(), loadCartData(), loadOrderHistory()]);
      } catch (error) {
        Alert.alert('Error', 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Filter meat based on active tab and search query
  useEffect(() => {
    filterMeat();
  }, [searchQuery, activeTab, meat]);

  const loadMeatData = async () => {
    try {
      const response = await api.getAvailableMeat();
      setMeat(response.data.meat || []);
    } catch (error) {
      console.error('Error loading meat:', error);
      throw error;
    }
  };

  const loadCartData = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        setCart(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      throw error;
    }
  };

  const loadOrderHistory = async () => {
    try {
      const response = await api.getCustomerOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadMeatData(), loadOrderHistory()]);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const filterMeat = () => {
    let filtered = meat.filter(item => 
      item.category?.toLowerCase() === activeTab.toLowerCase()
    );
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.butchery?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMeat(filtered);
  };

  // Cart operations
  const handleAddToCart = async (item) => {
    if (item.stock <= 0) {
      Alert.alert('Out of Stock', 'This item is currently unavailable');
      return;
    }

    try {
      const existingItem = cart.find(cartItem => cartItem._id === item._id);
      let updatedCart;
      
      if (existingItem) {
        updatedCart = cart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        updatedCart = [...cart, { ...item, quantity: 1 }];
      }
      
      setCart(updatedCart);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      Alert.alert('Success', 'Item added to cart!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      const updatedCart = cart.filter(item => item._id !== itemId);
      setCart(updatedCart);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const handleUpdateCartQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        handleRemoveFromCart(itemId);
        return;
      }
      
      const updatedCart = cart.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      const response = await api.placeOrder(cart);
      Alert.alert('Success', 'Order placed successfully!');
      setCart([]);
      await AsyncStorage.removeItem('cart');
      loadOrderHistory();
      setActiveBottomTab('orders');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'cart']);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Render functions for different UI components
  const renderMeatItem = ({ item }) => (
    <View style={[styles.card, styles.cardHighlight]}>
      <View style={styles.itemRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.text, styles.textBold]}>{item.name}</Text>
          <Text style={styles.textLight}>{item.butchery}</Text>
          <Text style={[styles.text, { color: styles.colors.primary }]}>
            KES {item.price}/kg
          </Text>
          <Text style={styles.textLight}>Stock: {item.stock}kg</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.buttonSmall, item.stock <= 0 && { opacity: 0.5 }]}
          onPress={() => handleAddToCart(item)}
          disabled={item.stock <= 0}
        >
          <Text style={styles.buttonText}>
            {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.itemRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.text, styles.textBold]}>{item.name}</Text>
          <Text style={[styles.text, { color: styles.colors.primary }]}>
            KES {item.price}/kg
          </Text>
          <Text style={styles.textLight}>Subtotal: KES {(item.price * item.quantity).toFixed(2)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall, { marginRight: 8 }]}
            onPress={() => handleUpdateCartQuantity(item._id, item.quantity - 1)}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.text, { marginHorizontal: 8 }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall, { marginRight: 8 }]}
            onPress={() => handleUpdateCartQuantity(item._id, item.quantity + 1)}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall, styles.buttonDanger]}
            onPress={() => handleRemoveFromCart(item._id)}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View style={[styles.card, styles.cardHighlight]}>
      <Text style={styles.textLight}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={[styles.text, styles.textBold]}>
        Status: <Text style={{ color: getStatusColor(item.status) }}>{item.status}</Text>
      </Text>
      <Text style={[styles.text, { color: styles.colors.primary }]}>
        Total: KES {item.total}
      </Text>
      <Text style={styles.textLight}>Items: {item.items?.length || 0}</Text>
      {item.deliveryDate && (
        <Text style={styles.textLight}>
          Expected Delivery: {new Date(item.deliveryDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const renderProfile = () => (
    <View style={styles.content}>
      <Text style={[styles.text, styles.textBold, { textAlign: 'center', marginBottom: 16 }]}>
        {userName}
      </Text>
      <Text style={[styles.textLight, { textAlign: 'center', marginBottom: 24 }]}>
        Customer
      </Text>
      
      <TouchableOpacity style={[styles.button, { marginBottom: 12 }]}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, { marginBottom: 12 }]}>
        <Text style={styles.buttonText}>Delivery Addresses</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, { marginBottom: 12 }]}>
        <Text style={styles.buttonText}>Payment Methods</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.buttonOutline]} 
        onPress={handleLogout}
      >
        <Text style={styles.buttonOutlineText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  // Helper functions
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return styles.colors.warning;
      case 'delivered':
        return styles.colors.success;
      case 'cancelled':
        return styles.colors.danger;
      default:
        return styles.colors.textDark;
    }
  };

  const getHeaderTitle = () => {
    switch (activeBottomTab) {
      case 'browse': return `Welcome, ${userName}!`;
      case 'cart': return `Cart (${cart.length})`;
      case 'orders': return 'Order History';
      case 'profile': return 'Profile';
      default: return 'NyamaLink';
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={styles.colors.primary} />
        <Text style={[styles.text, { marginTop: 16 }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        {activeBottomTab === 'browse' && (
          <TouchableOpacity onPress={handleLogout}>
            <Text style={{ color: styles.colors.white }}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      {activeBottomTab === 'browse' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Search meat or butchery..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabContainer}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {meatCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.tab, activeTab === category && styles.tabActive]}
                onPress={() => setActiveTab(category)}
              >
                <Text style={[styles.tabText, activeTab === category && styles.tabTextActive]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredMeat}
            renderItem={renderMeatItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={refreshData}
                colors={[styles.colors.primary]}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyState}>
                {searchQuery 
                  ? 'No matching meat found' 
                  : 'No meat available in this category'}
              </Text>
            }
          />
        </>
      )}

      {activeBottomTab === 'cart' && (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.content}
            ListEmptyComponent={
              <Text style={styles.emptyState}>Your cart is empty</Text>
            }
          />

          {cart.length > 0 && (
            <View style={{ padding: 16, backgroundColor: styles.colors.white }}>
              <Text style={[styles.text, styles.textBold, { textAlign: 'center', marginBottom: 12 }]}>
                Total: KES {getTotalPrice()}
              </Text>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handlePlaceOrder}
              >
                <Text style={styles.buttonText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {activeBottomTab === 'orders' && (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={refreshData}
              colors={[styles.colors.primary]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyState}>No orders yet</Text>
          }
        />
      )}

      {activeBottomTab === 'profile' && renderProfile()}

      <View style={styles.bottomNavigation}>
        {bottomTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.navItem, 
              activeBottomTab === tab.id && styles.activeNavItem
            ]}
            onPress={() => setActiveBottomTab(tab.id)}
          >
            <Text style={[
              styles.navText, 
              activeBottomTab === tab.id && styles.activeNavText
            ]}>
              {tab.id === 'cart' ? `Cart (${cart.length})` : tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}