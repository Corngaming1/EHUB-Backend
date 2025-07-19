<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['user', 'items.product'])
            ->where('archived', false)
            ->get()
            ->map(function ($order) {
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
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'quantity' => $item->quantity,
                            'product' => $item->product ? [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                            ] : null,
                        ];
                    }),
                ];
            });

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    public function create()
    {
        return Inertia::render('orders/create', [
            'users' => User::all(['id', 'name']),
            'products' => Product::all(['id', 'name', 'price', 'quantity', 'is_active']),
        ]);
    }

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

        $order = Order::create($validatedOrder);

        $grandTotal = 0;

        foreach ($validatedOrder['items'] as $itemData) {
            $product = Product::findOrFail($itemData['product_id']);

            if (!$product->is_active) {
                return back()->withErrors(['items' => "Product {$product->name} is not active."]);
            }

            if ($product->quantity < $itemData['quantity']) {
                return back()->withErrors(['items' => "Only {$product->quantity} of {$product->name} available."]);
            }

            $order->items()->create([
                'product_id' => $product->id,
                'quantity' => $itemData['quantity'],
                'unit_amount' => $product->price,
            ]);

            $grandTotal += $product->price * $itemData['quantity'];
            $product->quantity -= $itemData['quantity'];
            $product->save();
        }

        $order->grand_total = $grandTotal;
        $order->save();

        return redirect()->route('orders.index')->with('success', 'Order created successfully.');
    }

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
            'products' => Product::all(['id', 'name', 'price', 'quantity', 'is_active']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

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

        $order->update($validated);
        $order->items()->delete();

        $grandTotal = 0;

        foreach ($validated['items'] as $itemData) {
            $product = Product::findOrFail($itemData['product_id']);

            if (!$product->is_active) {
                return back()->withErrors(['items' => "Product {$product->name} is not active."]);
            }

            if ($product->quantity < $itemData['quantity']) {
                return back()->withErrors(['items' => "Only {$product->quantity} of {$product->name} available."]);
            }

            $order->items()->create([
                'product_id' => $itemData['product_id'],
                'quantity' => $itemData['quantity'],
                'unit_amount' => $itemData['unit_amount'],
            ]);

            $grandTotal += $itemData['unit_amount'] * $itemData['quantity'];

            $product->quantity -= $itemData['quantity'];
            $product->save();
        }

        $order->update(['grand_total' => $grandTotal]);

        return redirect()->route('orders.index')->with('success', 'Order updated successfully!');
    }

    public function destroy(Order $order)
    {
        foreach ($order->items as $item) {
            $product = $item->product;
            if ($product) {
                $product->quantity += $item->quantity;
                $product->save();
            }
        }

        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
    }

    public function markAsCompleted(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->status = 'delivered';
        $order->payment_status = 'paid';
        $order->archived = true;
        $order->save();

        return redirect()->route('orders.index')->with('success', 'Order marked as completed and archived.');
    }

    public function unarchive($id)
    {
        $order = Order::findOrFail($id);
        $order-> status = 'canceled';
        $order-> payment_status = 'failed';
        $order->archived = false;
        $order->save();

        return redirect()->route('orders.archived')->with('success', 'Order unarchived successfully.');
    }

    public function archived()
    {
        $orders = Order::where('archived', true)
            ->with(['user', 'items.product'])
            ->get()
            ->map(function ($order) {
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
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'quantity' => $item->quantity,
                            'product' => $item->product ? [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                            ] : null,
                        ];
                    }),
                ];
            });

        return Inertia::render('orders/Archived', [
            'orders' => $orders,
        ]);
    }
}