import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';


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
    };

    type OrdersPageProps = PageProps & {
        orders: Order[];
    };

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
                                            <TableHead>{order.status}</TableHead>
                                            <TableHead>{order.grand_total}</TableHead>
                                            <TableHead>{order.payment_method}</TableHead>
                                            <TableHead>{order.payment_status}</TableHead>
                                            <TableHead>{order.currency}</TableHead>
                                            <TableHead>
                                                {/* Add edit/delete actions here */}
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