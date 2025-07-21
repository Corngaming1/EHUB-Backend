<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
                    'phone' => $order->phone,
                    'location' => $order->location,
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
        DB::beginTransaction();

        try {
            $validatedOrder = $request->validate([
                'user_id' => 'required|exists:users,id',
                'payment_method' => 'required|string|max:255',
                'payment_status' => 'required|string|max:255',
                'status' => 'required|in:new,processing,shipped,delivered,canceled',
                'currency' => 'required|string|max:10',
                'shipping_amount' => 'nullable|numeric',
                'shipping_method' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
                'phone' => 'nullable|string|max:255',
                'location' => 'nullable|string|max:255',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            $grandTotal = 0;
            $itemDataList = [];

            foreach ($validatedOrder['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);

                if (!$product->is_active) {
                    return response()->json(['message' => "Product {$product->name} is not active."], 422);
                }

                if ($product->quantity < $itemData['quantity']) {
                    return response()->json(['message' => "Only {$product->quantity} of {$product->name} available."], 422);
                }

                $unitAmount = $product->price;
                $grandTotal += $unitAmount * $itemData['quantity'];

                $itemDataList[] = [
                    'product' => $product,
                    'quantity' => $itemData['quantity'],
                    'unit_amount' => $unitAmount,
                ];
            }
                $voucher = null;
                if ($request->filled('voucher')) {
                    $voucher = \App\Models\Voucher::where('code', $request->voucher)
                        ->where('active', true)
                        ->whereDate('expires_at', '>=', now())
                        ->first();

                    // Check if voucher exists and is unused
                    if ($voucher) {
                        $alreadyUsed = \App\Models\VoucherRequest::where('voucher_id', $voucher->id)
                            ->where('status', 'approved')
                            ->exists();

                        if ($alreadyUsed) {
                            return response()->json(['message' => 'Voucher code already used.'], 422);
                        }

                        // Apply discount
                        if ($voucher->type === 'fixed') {
                            $grandTotal = max(0, $grandTotal - $voucher->discount_amount);
                        } elseif ($voucher->type === 'percent') {
                            $grandTotal = max(0, $grandTotal * (1 - $voucher->discount_amount / 100));
                        }
                    } else {
                        return response()->json(['message' => 'Invalid or expired voucher code.'], 422);
                    }
                }
            $order = Order::create([
                'user_id' => $validatedOrder['user_id'],
                'payment_method' => $validatedOrder['payment_method'],
                'payment_status' => $validatedOrder['payment_status'],
                'status' => $validatedOrder['status'],
                'currency' => $validatedOrder['currency'],
                'shipping_amount' => $validatedOrder['shipping_amount'] ?? 0,
                'shipping_method' => $validatedOrder['shipping_method'] ?? null,
                'notes' => $validatedOrder['notes'] ?? null,
                'phone' => $validatedOrder['phone'] ?? null,
                'location' => $validatedOrder['location'] ?? null,
                'grand_total' => $grandTotal,
            ]);
            if ($voucher) {
            \App\Models\VoucherRequest::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'voucher_id' => $voucher->id,
                'status' => 'approved', // Mark as approved since discount is applied instantly
            ]);
        }

            foreach ($itemDataList as $item) {
                $order->items()->create([
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'unit_amount' => $item['unit_amount'],
                ]);

                $item['product']->quantity -= $item['quantity'];
                $item['product']->save();
            }

            DB::commit();

            return response()->json(['message' => 'Order created successfully', 'order_id' => $order->id], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Unexpected error', 'error' => $e->getMessage()], 500);
        }
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
                'phone' => $order->phone,
                'location' => $order->location,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
                'user' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                ] : null,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'unit_amount' => $item->unit_amount,
                        'product' => $item->product ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'price' => $item->product->price,
                        ] : null,
                    ];
                }),
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
        DB::beginTransaction();

        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'payment_method' => 'required|string',
                'payment_status' => 'required|string',
                'status' => 'required|string',
                'currency' => 'required|string',
                'shipping_amount' => 'required|numeric',
                'shipping_method' => 'required|string',
                'notes' => 'nullable|string',
                'phone' => 'nullable|string|max:255',
                'location' => 'nullable|string|max:255',
                'items' => 'required|array',
                'items.*.id' => 'nullable|integer',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_amount' => 'required|numeric|min:0',
            ]);

            $order->update($validated);

            foreach ($order->items as $item) {
                $product = $item->product;
                if ($product) {
                    $product->quantity += $item->quantity;
                    $product->save();
                }
            }

            $order->items()->delete();
            $grandTotal = 0;

            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);

                if (!$product->is_active) {
                    DB::rollBack();
                    return back()->withErrors(['items' => "Product {$product->name} is not active."]);
                }

                if ($product->quantity < $itemData['quantity']) {
                    DB::rollBack();
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
            DB::commit();

            return redirect()->route('orders.index')->with('success', 'Order updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Unexpected error: ' . $e->getMessage()]);
        }
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
    DB::beginTransaction();

    try {
        $order = Order::with('items.product')->findOrFail($id);

        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->quantity += $item->quantity;
                $item->product->save();
            }
        }

        $order->status = 'canceled';
        $order->payment_status = 'failed';
        $order->archived = false;
        $order->save();

        DB::commit();

        return redirect()->route('orders.archived')->with('success', 'Order unarchived and stock restored.');
    } catch (\Exception $e) {
        DB::rollBack();
        return redirect()->route('orders.archived')->with('error', 'Failed to unarchive order: ' . $e->getMessage());
    }
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
                    'phone' => $order->phone,
                    'location' => $order->location,
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
