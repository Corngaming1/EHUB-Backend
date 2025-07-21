import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon, MoreVertical } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  product?: { id: number; name: string };
};

type VoucherInfo = {
  code: string;
  status: string;
  discount_amount: string;
  type: string;
};

type Order = {
  id: number;
  grand_total: string;
  payment_method: string;
  payment_status: string;
  status: string;
  currency: string;
  shipping_amount: string | null;
  shipping_method: string | null;
  notes: string | null;
  user: { id: number; name: string } | null;
  items: OrderItem[];
  voucher?: VoucherInfo | null;
};

type PageProps = {
  auth?: AuthUser;
  orders: Order[];
  [key: string]: unknown;
};

type FlashProps = {
  success?: string;
  error?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Orders',
    href: '/orders',
  },
];

export default function OrdersIndex() {
  const { flash } = usePage<{ flash: FlashProps } & PageProps>().props;

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const menuDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (flash.success) {
      toast.success(flash.success);
    }
  }, [flash]);

  function handleMenuToggle(id: number) {
    if (openMenuId === id) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      setOpenMenuId(id);
      const btn = buttonRefs.current[id];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setMenuPosition({
          left: rect.left,
          top: rect.bottom + 4,
        });
      }
    }
  }

  function handleMenuClose() {
    setOpenMenuId(null);
    setMenuPosition(null);
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this order?')) {
      Inertia.delete(route('orders.destroy', id));
    }
  }

  function handleMarkAsCompleted(orderId: number) {
    if (confirm('Mark this order as completed and delivered?')) {
      Inertia.put(route('orders.markAsCompleted', orderId), {
        status: 'delivered',
        payment_status: 'paid'
      });
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    }
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const { orders } = usePage<PageProps>().props;

  // Helper to get total quantity for an order
  function getOrderTotalQuantity(order: Order) {
    return order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Orders" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className='rounded border p-6 shadow-xl'>
          <div className='mb-4'>
            <Label htmlFor="order-search">Order Search</Label>
            <div className="flex items-end gap-2 mt-2">
              <Input id="order-search" placeholder="Search orders..." type="text" />
              <Link href="/orders/create">
                <Button variant="outline" className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">Add new Order</span>
                </Button>
              </Link>
              <Link href="/orders/archived">
                <Button
                  variant="outline"
                  className="ml-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition active:scale-95"
                >
                  Archived Orders
                </Button>
              </Link>
            </div>
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <input type="checkbox" disabled />
                    </TableHead>
                    <TableHead>#</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Voucher</TableHead>
                    <TableHead>Discounted Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={order.status === 'completed' && order.payment_status === 'delivered'}
                          onChange={() => handleMarkAsCompleted(order.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </TableCell>
                      <TableHead>{idx + 1}</TableHead>
                      <TableHead>
                        {order.user ? `${order.user.name} (ID: ${order.user.id})` : 'N/A'}
                      </TableHead>
                      <TableHead>{order.status}</TableHead>
                      <TableHead>₱{order.grand_total}</TableHead>
                      <TableHead>{order.payment_method}</TableHead>
                      <TableHead>{order.payment_status}</TableHead>
                      <TableHead>
                        {getOrderTotalQuantity(order)}
                      </TableHead>
                      <TableHead>
                        {order.voucher
                          ? `${order.voucher.code} (${order.voucher.status})`
                          : '—'}
                      </TableHead>
                      <TableHead>
                        {order.voucher && order.voucher.status === 'approved'
                          ? order.voucher.type === 'fixed'
                            ? `₱${(parseFloat(order.grand_total) - parseFloat(order.voucher.discount_amount)).toFixed(2)}`
                            : `₱${(parseFloat(order.grand_total) * (1 - parseFloat(order.voucher.discount_amount) / 100)).toFixed(2)}`
                          : `₱${order.grand_total}`}
                      </TableHead>
                      <TableHead>
                        <div className="relative">
                          <Button
                            ref={el => { buttonRefs.current[order.id] = el; }}
                            size="icon"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation();
                              handleMenuToggle(order.id);
                            }}
                            aria-label="Actions"
                          >
                            <MoreVertical />
                          </Button>
                          {openMenuId === order.id && menuPosition && (
                            <div
                              ref={menuDropdownRef}
                              className="fixed z-50 w-32 rounded-md shadow-lg text-gray-900 dark:text-gray-900 bg-white ring-1 ring-black ring-opacity-5"
                              style={{
                                left: menuPosition.left,
                                top: menuPosition.top,
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="py-1 flex flex-col">
                                <Link href={route('orders.show', order.id)}>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    onClick={handleMenuClose}
                                  >
                                    Show
                                  </button>
                                </Link>
                                <Link href={route('orders.edit', order.id)}>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    onClick={handleMenuClose}
                                  >
                                    Edit
                                  </button>
                                </Link>
                                <hr className="my-1" />
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
                                  onClick={() => {
                                    handleMenuClose();
                                    handleDelete(order.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
      </div>
    </AppLayout>
  );
}