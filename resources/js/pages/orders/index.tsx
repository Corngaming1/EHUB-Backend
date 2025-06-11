import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';


// Define a minimal PageProps type if not available from elsewhere
type PageProps = {
    auth?: any;
    [key: string]: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
    title: 'Orders',
    href: '/orders',
    },
];

export default function OrdersIndex() {
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
    };


    type OrdersPageProps = PageProps & {
        orders: Order[];
    };

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
    const menuDropdownRef = useRef<HTMLDivElement | null>(null);

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

    const { orders } = usePage<OrdersPageProps>().props;

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
    <Button variant="outline" className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
 <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
 <span className="max-sm:sr-only">Add new Order</span>
    </Button>
</Link>
   </div>
      </div>
      <Card>
   <CardContent>
<Table>
    <TableHeader>
 <TableRow>
     <TableHead>#</TableHead>
     <TableHead>User</TableHead>
     <TableHead>Status</TableHead>
     <TableHead>Grand Total</TableHead>
     <TableHead>Payment Method</TableHead>
     <TableHead>Payment Status</TableHead>
     <TableHead>Currency</TableHead>
     <TableHead>Action</TableHead>
 </TableRow>
    </TableHeader>
      <TableBody>
     {orders.map((order, idx) => (
  <TableRow key={order.id}>
      <TableHead>{idx + 1}</TableHead>
      <TableHead>
   {order.user ? `${order.user.name} (ID: ${order.user.id})` : 'N/A'}
      </TableHead>
      <TableHead>{order.status}</TableHead>
      <TableHead>{order.grand_total}</TableHead>
      <TableHead>{order.payment_method}</TableHead>
      <TableHead>{order.payment_status}</TableHead>
      <TableHead>{order.currency}</TableHead>
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
 className="fixed z-50 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
 style={{
     left: menuPosition.left,
     top: menuPosition.top,
 }}
 onClick={e => e.stopPropagation()}
    >
 <div className="py-1 flex flex-col">
     <Link href={route('orders.show', order.id)}>
  <button
      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      onClick={handleMenuClose}
  >
      Show
  </button>
     </Link>
     <Link href={route('orders.edit', order.id)}>
  <button
      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      onClick={handleMenuClose}
  >
      Edit
  </button>
     </Link>
     <hr className="my-1" />
     <button
  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
  </div>
     </div>
 </AppLayout>
    );
}