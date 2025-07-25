import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Create Order',
    href: '/orders/create',
  },
];

type Product = { id: number; name: string; price: number; quantity: number; is_active?: boolean };
type PageProps = { users: User[]; products: Product[] };

export default function OrdersCreate() {
  const { users, products } = usePage<PageProps>().props;

  const { data, setData, post } = useForm<{
    user_id: string;
    items: { product_id: string; quantity: number; price: number }[];
    grand_total: string;
    payment_method: string;
    payment_status: string;
    status: string;
    currency: string;
    shipping_method: string;
    notes: string;
  }>({
    user_id: users.length > 0 ? String(users[0].id) : '',
    items: products.length > 0 ? [{
      product_id: String(products[0].id),
      quantity: 1,
      price: products[0].price,
    }] : [],
    grand_total: '0.00',
    payment_method: 'COD',
    payment_status: 'new',
    status: 'new',
    currency: 'PHP',
    shipping_method: 'for_Pickup',
    notes: '',
  });

  // Update grand_total whenever items change
  useEffect(() => {
    const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setData('grand_total', total.toFixed(2));
  }, [data.items, setData]);

  // Handle product change in an item
  function handleProductChange(index: number, productId: string) {
    const product = products.find(p => String(p.id) === productId);
    if (!product) return;
    const newItems = [...data.items];
    newItems[index].product_id = productId;
    newItems[index].price = product.price;
    // Reset quantity to 1 if new product has less stock than current quantity
    newItems[index].quantity = Math.min(newItems[index].quantity, product.quantity) || 1;
    setData('items', newItems);
  }

  // Handle quantity change in an item
  function handleQuantityChange(index: number, quantity: number) {
    const selectedProduct = products.find(p => String(p.id) === data.items[index].product_id);
    const maxQty = selectedProduct ? selectedProduct.quantity : 1;
    const newItems = [...data.items];
    newItems[index].quantity = Math.max(1, Math.min(quantity, maxQty));
    setData('items', newItems);
  }

  // Add a new empty item
  function addItem() {
    if (products.length === 0) return;
    setData('items', [
      ...data.items,
      { product_id: String(products[0].id), quantity: 1, price: products[0].price },
    ]);
  }

  // Remove an item
  function removeItem(index: number) {
    const newItems = data.items.filter((_, i) => i !== index);
    setData('items', newItems);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Order" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="rounded border p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xl text-slate-600">Create Order</div>
            <Link href="/orders">
              <Button
              variant="outline"
              className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Back To Orders
            </Button>
            </Link>
          </div>
          <Card>
            <CardContent>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  post(route('orders.store'));
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="user_id">User</Label>
                    <select
                      id="user_id"
                      value={data.user_id}
                      onChange={e => setData('user_id', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} (ID: {user.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Items */}
                  <div className="col-span-2">
                    <Label>Products</Label>
                    {data.items.map((item, index) => {
                      const selectedProduct = products.find(p => String(p.id) === item.product_id);
                      return (
                        <div key={index} className="flex gap-2 mb-3 items-center">
                          <select
                            value={item.product_id}
                            onChange={e => handleProductChange(index, e.target.value)}
                            className="border rounded px-3 py-2 flex-grow"
                            required
                          >
                            {products.map(product => (
                              <option
                                key={product.id}
                                value={product.id}
                                disabled={product.quantity === 0 || product.is_active === false}
                              >
                                {product.name} (₱{product.price}) - {product.quantity} in stock
                                {!product.is_active ? ' [Inactive]' : ''}
                              </option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min={1}
                            max={selectedProduct?.quantity ?? 1}
                            value={item.quantity}
                            disabled={!selectedProduct || selectedProduct.quantity === 0 || selectedProduct.is_active === false}
                            onChange={e => handleQuantityChange(index, Number(e.target.value))}
                            className="w-24"
                            required
                          />
                          {selectedProduct && selectedProduct.quantity === 0 && (
                            <span className="text-red-600 text-xs ml-2">Out of stock</span>
                          )}
                          {selectedProduct && selectedProduct.is_active === false && (
                            <span className="text-yellow-600 text-xs ml-2">Inactive</span>
                          )}
                          <Button
                              type="button"
                              variant="destructive"
                              onClick={() => removeItem(index)}
                              className="cursor-pointer transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                              Remove
                            </Button>
                        </div>
                      );
                    })}
                    <Button
                    type="button"
                    onClick={addItem}
                    className="mb-4 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Add Product
                  </Button>
                  </div>

                  {/* Grand Total */}
                  <div className="col-span-2 text-current md:col-span-1">
                    <Label htmlFor="grand_total">Grand Total</Label>
                    <Input
                      type="text"
                      id="grand_total"
                      value={data.grand_total}
                      readOnly
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  {/* Other fields */}
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <select
                      id="payment_method"
                      value={data.payment_method}
                      onChange={e => setData('payment_method', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="COD" style={{ color: 'black' }}>
                        COD
                      </option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={data.status}
                      onChange={e => {
                        setData('status', e.target.value);
                        setData('payment_status', e.target.value); // keep in sync
                      }}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="new" style={{ color: 'black' }}>
                        New
                      </option>
                      <option value="processing" style={{ color: 'black' }}>
                        Processing
                      </option>
                      <option value="shipped" style={{ color: 'black' }}>
                        Shipped
                      </option>
                      <option value="delivered" style={{ color: 'black' }}>
                        Delivered
                      </option>
                      <option value="canceled" style={{ color: 'black' }}>
                        Canceled
                      </option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <select
                      id="payment_status"
                      value={data.payment_status}
                      onChange={e => setData('payment_status', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="new" style={{ color: 'black' }}>
                        New
                      </option>
                      <option value="paid" style={{ color: 'black' }}>
                        Paid
                      </option>
                      <option value="pending" style={{ color: 'black' }}>
                        Pending
                      </option>
                      <option value="failed" style={{ color: 'black' }}>
                        Failed
                      </option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      type="text"
                      id="currency"
                      value={data.currency}
                      readOnly
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="shipping_method">Shipping Method</Label>
                    <select
                      id="shipping_method"
                      value={data.shipping_method}
                      onChange={e => setData('shipping_method', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="for_Pickup" style={{ color: 'black' }}>
                        For Pickup
                      </option>
                      <option value="j&t" style={{ color: 'black' }}>
                        J&T
                      </option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      type="text"
                      id="notes"
                      placeholder="Notes"
                      value={data.notes}
                      onChange={e => setData('notes', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 mt-4">
                    <Button
                      type="submit"
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white w-full transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Create Order
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}