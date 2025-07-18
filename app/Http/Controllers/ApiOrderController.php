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

        // Find or create the user (optional password since it's anonymous)
        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name' => 'Guest_' . Str::random(5),
                'password' => Hash::make(Str::random(8)),
            ]
        );

        // Create the order
        $order = Order::create([
            'user_id' => $user->id,
            'grand_total' => $request->total,
            'payment_method' => $request->deliveryOption,
            'payment_status' => 'Pending',
            'status' => 'Pending',
            'currency' => 'PHP',
            'shipping_amount' => 0,
            'shipping_method' => $request->deliveryOption,
            'notes' => 'Phone: ' . $request->phone . ', Location: ' . $request->location,
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
