import React from 'react'
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react'
import { Card, CardContent } from '@/components/ui/card'
import { router, usePage } from '@inertiajs/react';

// Define types for props
type Order = {
  id: number
  user?: { id: number; name: string } | null
  status: string
  grand_total: number
  currency: string
  payment_status: string
  created_at: string
}

type ArchivedOrdersProps = {
  orders: Order[]
}
type FlashProps = {
  flash?: {
    message?: string
  }
}




export default function Archived({ orders }: ArchivedOrdersProps) {
const { props } = usePage<FlashProps>();
const message = props.flash?.message;
  return (
    <AppLayout>

      <Head title="Archived Orders" />
      {message && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">
            {message}
        </div>
        )}
      
      <h1 className="text-2xl font-bold mb-4">Archived (Completed) Orders</h1>
      
        <div className="mb-4">
        <a
            href="/orders"
            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded transition"
        >
            ← Back to Orders
        </a>
        </div>
      <Card>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th>ID</th>
                <th>User</th>
                <th>Status</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b">
                  <td>{order.id}</td>
                  <td>{order.user?.name || '—'}</td>
                  <td>{order.status}</td>
                  <td>{order.currency} {order.grand_total}</td>
                  <td>{order.payment_status}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                        onClick={() => {
                        if (confirm('Are you sure you want to unarchive this order?')) {
                            router.patch(`/orders/${order.id}/unarchive`);
                        }
                        }}
                        className="text-blue-500 hover:underline"
                    >
                        Unarchive
                    </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  )
}