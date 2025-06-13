import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Orders', href: '/orders' },
  { title: 'Edit Order', href: '' },
];

type Product = {
  id: number;
  name: string;
  price: number;
};

type User = {
  id: number;
  name: string;
};

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_amount: number;
};

type Order = {
  id: number;
  user_id: number;
  payment_method: string;
  payment_status: string;
  status: string;
  currency: string;
  shipping_amount: number;
  shipping_method: string;
  notes: string;
  items: OrderItem[];
};

type FormOrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_amount: number;
};

export default function EditOrder({
  order,
  users,
  products,
}: {
  order: Order;
  users: User[];
  products: Product[];
}) {
  const { data, setData, processing, errors } = useForm<{
    user_id: string | number;
    payment_method: string;
    payment_status: string;
    status: string;
    currency: string;
    shipping_amount: number;
    shipping_method: string;
    notes: string;
    items: FormOrderItem[];
    grand_total?: string;
  }>({
    user_id: order.user_id || '',
    payment_method: order.payment_method || 'COD',
    payment_status: order.payment_status || 'new',
    status: order.status || 'new',
    currency: order.currency || 'PHP',
    shipping_amount: order.shipping_amount ?? 0,
    shipping_method: order.shipping_method || 'for_Pickup',
    notes: order.notes || '',
    items:
      order.items?.map((item: OrderItem) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
      })) || [],
  });

  React.useEffect(() => {
    const total = data.items.reduce(
      (sum: number, item) => sum + item.unit_amount * item.quantity,
      0
    );
    setData((prevData) => ({
      ...prevData,
      grand_total: total.toFixed(2),
    }));
  }, [data.items, setData]);

  function handleProductChange(index: number, productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newItems = [...data.items];
    newItems[index] = {
      ...newItems[index],
      product_id: productId,
      unit_amount: product.price,
    };
    setData('items', newItems);
  }

  function handleQuantityChange(index: number, quantity: number) {
    const newItems = [...data.items];
    newItems[index].quantity = quantity > 0 ? quantity : 1;
    setData('items', newItems);
  }

  function addItem() {
    if (products.length === 0) return;
    setData('items', [
      ...data.items,
      {
        id: 0,
        product_id: products[0].id,
        quantity: 1,
        unit_amount: products[0].price,
      },
    ]);
  }

  function removeItem(index: number) {
    const newItems = data.items.filter((_, i) => i !== index);
    setData('items', newItems);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('user_id', String(data.user_id));
    formData.append('payment_method', data.payment_method);
    formData.append('payment_status', data.payment_status);
    formData.append('status', data.status);
    formData.append('currency', data.currency);
    formData.append('shipping_amount', String(data.shipping_amount));
    formData.append('shipping_method', data.shipping_method);
    formData.append('notes', data.notes);

    data.items.forEach((item, index) => {
      formData.append(`items[${index}][id]`, String(item.id));
      formData.append(`items[${index}][product_id]`, String(item.product_id));
      formData.append(`items[${index}][quantity]`, String(item.quantity));
      formData.append(`items[${index}][unit_amount]`, String(item.unit_amount));
    });

    Inertia.post(route('orders.update', order.id), formData);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Order #${order.id}`} />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit Order</h1>
          <Link href="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {/* User Select */}
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="user_id">User</Label>
                  <select
                    id="user_id"
                    value={data.user_id}
                    onChange={(e) => setData('user_id', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} (ID: {user.id})
                      </option>
                    ))}
                  </select>
                  {errors.user_id && <p className="text-red-600">{errors.user_id}</p>}
                </div>

                {/* Order Items */}
                <div className="col-span-2">
                  <Label>Products</Label>
                  {data.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-3 items-center">
                      <select
                        value={item.product_id}
                        onChange={(e) => handleProductChange(index, Number(e.target.value))}
                        className="border rounded px-3 py-2 flex-grow"
                        required
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (₱{product.price})
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, Number(e.target.value))
                        }
                        className="w-24"
                        required
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={addItem} className="mb-4">
                    Add Product
                  </Button>
                </div>

                {/* Grand Total */}
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="grand_total">Grand Total</Label>
                  <Input
                    type="text"
                    id="grand_total"
                    value={data.grand_total ?? '0.00'}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                {/* Payment Method */}
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <select
                    id="payment_method"
                    value={data.payment_method}
                    onChange={(e) => setData('payment_method', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="COD">COD</option>
                  </select>
                  {errors.payment_method && (
                    <p className="text-red-600">{errors.payment_method}</p>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={data.status}
                    onChange={(e) => {
                      setData('status', e.target.value);
                      setData('payment_status', e.target.value); // keep in sync
                    }}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="new">New</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="canceled">Canceled</option>
                  </select>
                  {errors.status && <p className="text-red-600">{errors.status}</p>}
                </div>

                {/* Payment Status */}
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="payment_status">Payment Status</Label>
                  <select
                    id="payment_status"
                    value={data.payment_status}
                    onChange={(e) => setData('payment_status', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="new">New</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  {errors.payment_status && (
                    <p className="text-red-600">{errors.payment_status}</p>
                  )}
                </div>

                {/* Currency */}
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    type="text"
                    id="currency"
                    value={data.currency}
                    readOnly
                    className="bg-gray-100"
                    style={{ color: 'black' }}
                  />
                </div>

                {/* Shipping Amount */}
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="shipping_amount">Shipping Amount</Label>
                  <Input
                    type="number"
                    id="shipping_amount"
                    value={data.shipping_amount}
                    onChange={(e) =>
                      setData('shipping_amount', Number(e.target.value))
                    }
                    min={0}
                    step="0.01"
                  />
                  {errors.shipping_amount && (
                    <p className="text-red-600">{errors.shipping_amount}</p>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="shipping_method">Shipping Method</Label>
                  <select
                    id="shipping_method"
                    value={data.shipping_method}
                    onChange={(e) => setData('shipping_method', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="for_Pickup">For Pickup</option>
                    <option value="j&t">J&T</option>
                  </select>
                  {errors.shipping_method && (
                    <p className="text-red-600">{errors.shipping_method}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    type="text"
                    id="notes"
                    placeholder="Notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                  />
                  {errors.notes && <p className="text-red-600">{errors.notes}</p>}
                </div>

                {/* Submit Button */}
                <div className="col-span-2 mt-4">
                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Order
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
