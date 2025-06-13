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
        $validatedOrder = $request->validate([
            'user_id' => 'required|exists:users,id',
            'payment_method' => 'required|string|max:255',
            'payment_status' => 'required|string|max:255',
            'status' => 'required|in:new,processing,shipped,delivered,canceled',
            'currency' => 'required|string|max:10',
            'shipping_amount' => 'nullable|numeric',
            'shipping_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Create order without grand_total initially
        $order = Order::create($validatedOrder);

        $grandTotal = 0;

        foreach ($validatedOrder['items'] as $itemData) {
            $product = Product::findOrFail($itemData['product_id']);
            $price = $product->price;
            $quantity = $itemData['quantity'];

            $order->items()->create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_amount' => $price,
            ]);

            $grandTotal += $price * $quantity;
        }

        // Update grand total
        $order->grand_total = $grandTotal;
        $order->save();

        return redirect()->route('orders.index')->with('success', 'Order created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['user', 'items.product']);

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
                'items' => $order->items->map(fn($item) => [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'unit_amount' => $item->unit_amount,
                'product' => $item->product ? $item->product->only(['id', 'name', 'price']) : null,
                ]),
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ],
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
public function update(Request $request, $id)
{
    // ✅ Fetch the order first
    $order = \App\Models\Order::findOrFail($id);

    // ✅ Then validate the request
    $validated = $request->validate([
        'user_id' => 'required|exists:users,id',
        'payment_method' => 'required|string',
        'payment_status' => 'required|string',
        'status' => 'required|string',
        'currency' => 'required|string',
        'shipping_amount' => 'required|numeric',
        'shipping_method' => 'required|string',
        'notes' => 'nullable|string',
        'items' => 'required|array',
        'items.*.id' => 'nullable|integer',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.unit_amount' => 'required|numeric|min:0',
    ]);

    // ✅ Now you can safely use $order
    $order->update($validated);

    // Delete old items and recreate them
    $order->items()->delete();

    $grandTotal = 0;

    foreach ($validated['items'] as $itemData) {
        $product = \App\Models\Product::findOrFail($itemData['product_id']);
        $quantity = $itemData['quantity'];
        $unitAmount = $itemData['unit_amount'];
        $grandTotal += $unitAmount * $quantity;

        $order->items()->create([
            'product_id' => $itemData['product_id'],
            'quantity' => $quantity,
            'unit_amount' => $unitAmount,
        ]);
    }

    $order->update(['grand_total' => $grandTotal]);

    return redirect()->route('orders.index')->with('success', 'Order updated successfully!');
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