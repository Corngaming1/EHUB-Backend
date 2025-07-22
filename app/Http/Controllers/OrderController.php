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
    $validated = $request->validate([
        'email' => 'required|email',
        'phone' => 'required|string',
        'location' => 'required|string',
        'deliveryOption' => 'required|string',
        'items' => 'required|array',
        'items.*.id' => 'required|integer|exists:products,id',
        'items.*.quantity' => 'required|integer|min:1',
        'voucher_code' => 'nullable|string',
    ]);

    // Check if user exists or create one
    $user = \App\Models\User::firstOrCreate(
        ['email' => $validated['email']],
        ['name' => 'Guest', 'password' => bcrypt('password')]
    );

    // Create order
    $order = \App\Models\Order::create([
        'user_id' => $user->id,
        'phone' => $validated['phone'],
        'location' => $validated['location'],
        'shipping_method' => $validated['deliveryOption'],
        'payment_status' => 'pending',
        'status' => 'pending',
        'voucher_code' => $validated['voucher_code'] ?? null,
    ]);

    $total = 0;
    $orderItems = [];

    foreach ($validated['items'] as $item) {
        $product = \App\Models\Product::findOrFail($item['id']);

        // Apply discount if on sale
        $finalPrice = $product->on_sale
            ? $product->price * (1 - ($product->discount_percentage / 100))
            : $product->price;

        $subtotal = $finalPrice * $item['quantity'];
        $total += $subtotal;

        $orderItems[] = [
            'product_id' => $product->id,
            'quantity' => $item['quantity'],
            'unit_amount' => $finalPrice, // ✅ fixed key here
        ];
    }

    // Create order items
    foreach ($orderItems as $item) {
        $order->items()->create($item);
    }

    // Update order total
    $order->grand_total = $total;
    $order->save();

    return response()->json([
        'success' => true,
        'message' => 'Order placed successfully!',
        'order_id' => $order->id,
    ]);
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
