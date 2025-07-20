<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiOrderController extends Controller
{
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
                'phone' => $order->phone,
                'location' => $order->location,
                'user' => $order->user ? $order->user->only(['id', 'name']) : null,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ];
        });

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
            'location' => 'required|string',
            'deliveryOption' => 'required|string',
            'cart' => 'required|array',
            'cart.*.id' => 'required|integer',
            'cart.*.name' => 'required|string',
            'cart.*.price' => 'required|numeric',
            'cart.*.quantity' => 'required|integer',
            'total' => 'required|numeric',
        ]);

        // Create or find user
        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name' => 'Guest_' . Str::random(5),
                'password' => Hash::make(Str::random(8)),
            ]
        );

        // Create order
        $order = Order::create([
            'user_id' => $user->id,
            'grand_total' => $request->total,
            'payment_method' => $request->deliveryOption,
            'payment_status' => 'Pending',
            'status' => 'new',
            'currency' => 'PHP',
            'shipping_amount' => 0,
            'shipping_method' => $request->deliveryOption,
            'phone' => $request->phone,
            'location' => $request->location,
            'notes' => 'Web checkout order',
        ]);

        // Create order items
        foreach ($request->cart as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['id'],
                'quantity' => $item['quantity'],
                'unit_amount' => $item['price'],
                'total_amount' => $item['price'] * $item['quantity'],
            ]);
        }

        return response()->json(['message' => 'Order placed successfully'], 201);
    }

    public function show(string $id)
    {
        // Optional: implement if needed
    }

    public function update(Request $request, string $id)
    {
        // Optional: implement if needed
    }

    public function destroy(string $id)
    {
        // Optional: implement if needed
    }
}
