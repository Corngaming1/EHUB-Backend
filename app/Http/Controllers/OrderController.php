<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
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

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('orders/create', [
            'users' => User::all(['id', 'name']),
            'products' => Product::all(['id', 'name', 'price']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'grand_total' => 'required|numeric',
            'payment_method' => 'required|string|max:255',
            'payment_status' => 'required|string|max:255',
            'status' => 'required|in:new,processing,shipped,delivered,canceled',
            'currency' => 'required|string|max:10',
            'shipping_amount' => 'nullable|numeric',
            'shipping_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

         // Find existing order with same user, product, status, payment_status
    $existingOrder = Order::where('user_id', $validated['user_id'])
        ->where('product_id', $validated['product_id'])
        ->where('status', $validated['status'])
        ->where('payment_status', $validated['payment_status'])
        ->first();

    if ($existingOrder) {
        // Update quantity and grand total
        $existingOrder->quantity += $validated['quantity'];
        $existingOrder->grand_total += $validated['grand_total']; // or recalc based on price * quantity
        $existingOrder->save();
    } else {
        Order::create($validated);
    }

    return redirect()->route('orders.index')->with('success', 'Order processed successfully.');
}

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load('user');

        return Inertia::render('orders/show', [
            'order' => [
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
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
  public function edit(Order $order)
{
    $order->load('user');

    return Inertia::render('orders/edit', [
        'order' => [
            'id' => $order->id,
            'grand_total' => $order->grand_total,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'currency' => $order->currency,
            'shipping_amount' => $order->shipping_amount,
            'shipping_method' => $order->shipping_method,
            'notes' => $order->notes,
            'user_id' => $order->user_id,
        ],
        'users' => User::all(['id', 'name']),
        'products' => Product::all(['id', 'name', 'price']),
    ]);
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|required|exists:users,id',
            'grand_total' => 'sometimes|required|numeric',
            'payment_method' => 'sometimes|required|string|max:255',
            'payment_status' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:new,processing,shipped,delivered,canceled',
            'currency' => 'sometimes|required|string|max:10',
            'shipping_amount' => 'nullable|numeric',
            'shipping_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $order->update($validated);

        return redirect()->route('orders.index')->with('success', 'Order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
    }
}