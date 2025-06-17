<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;

class ApiOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         $orders = Order::with('user')->get()->map(function ($order) {
            return [
                'id' => $order->id,
                'grand_total' => $order->grand_total,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'status' => $order->status,
                'currency' => $order->currency,
                'shipping_amount' => $order->shipping_amount,
                'shipping_method' => $order->shipping_method,
                'notes' => $order->notes,
                'user' => $order->user ? $order->user->only(['id', 'name']) : null,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ];
        });
         return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
