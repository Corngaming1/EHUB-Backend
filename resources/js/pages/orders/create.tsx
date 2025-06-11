import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Order',
        href: '/orders/create',
    },
];

export default function OrdersCreate() {
    const { data, setData, post } = useForm<{
        grand_total: string;
        payment_method: string;
        payment_status: string;
        status: string;
        currency: string;
        shipping_method: string;
        notes: string;
    }>({
        grand_total: '',
        payment_method: 'COD',
        payment_status: 'new',
        status: 'new',
        currency: 'PHP',
        shipping_method: 'for_Pickup',
        notes: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className='rounded border p-6 shadow-xl'>
                    <div className='mb-5 flex items-center justify-between'>
                        <div className="text-xl text-slate-600">Create Order</div>
                        <Link href="/orders">
                            <Button variant="outline" className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
                                Back To Orders
                            </Button>
                        </Link>
                    </div>
                    <Card>
                        <CardContent>
                            <form onSubmit={e => {
                                e.preventDefault();
                                post(route('orders.store'));
                            }}>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='col-span-2 md:col-span-1'>
                                        <Label htmlFor="grand_total">Grand Total</Label>
                                        <Input
                                            type='number'
                                            id='grand_total'
                                            placeholder='Grand Total'
                                            value={data.grand_total}
                                            onChange={e => setData('grand_total', e.target.value)}
                                        />
                                    </div>
                                    <div className='col-span-2 md:col-span-1'>
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                       <select
                                            id="payment_method"
                                            value={data.payment_method}
                                            onChange={e => setData('payment_method', e.target.value)}
                                            className="w-full border rounded px-3 py-2"
                                        >
                                            <option value="COD" style={{ color: 'black' }}>COD</option>
                                            {/* Add more options if needed */}
                                        </select>
                                    </div>
                                    <div className='col-span-2 md:col-span-1'>
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
                                        <option value="new" style={{ color: 'black' }}>New</option>
                                        <option value="processing" style={{ color: 'black' }}>Processing</option>
                                        <option value="shipped" style={{ color: 'black' }}>Shipped</option>
                                        <option value="delivered" style={{ color: 'black' }}>Delivered</option>
                                        <option value="canceled" style={{ color: 'black' }}>Canceled</option>
                                    </select>
                                    </div>
                                    <div className='col-span-2 md:col-span-1'>
                                        <Label htmlFor="currency">Currency</Label>
                                        <Input
                                            type='text'
                                            id='currency'
                                            value={data.currency}
                                            readOnly
                                            className="bg-gray-100"
                                            style={{ color: 'black' }}
                                        />
                                    </div>
                                    <div className='col-span-2 md:col-span-1'>
                                        <Label htmlFor="shipping_method">Shipping Method</Label>
                                        <select
                                            id="shipping_method"
                                            value={data.shipping_method}
                                            onChange={e => setData('shipping_method', e.target.value)}
                                            className="w-full border rounded px-3 py-2"
                                        >
                                            <option value="for_Pickup" style={{ color: 'black' }}>For Pickup</option>
                                            <option value="j&t" style={{ color: 'black' }}>J&T</option>
                                        </select>
                                    </div>
                                    <div className='col-span-2'>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Input
                                            type='text'
                                            id='notes'
                                            placeholder='Notes'
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                        />
                                    </div>
                                    <div className='col-span-2 mt-4'>
                                        <Button type="submit" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white w-full">
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