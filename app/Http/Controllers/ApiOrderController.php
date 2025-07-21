<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApiOrderController extends Controller
{
public function index()
{
    $orders = Order::with(['user', 'items.product', 'voucherRequests.voucher'])->get()->map(function ($order) {
        $voucherRequest = $order->voucherRequests()->where('status', 'approved')->latest()->first();
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
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_amount' => $item->unit_amount,
                    'product' => $item->product ? $item->product->only(['id', 'name']) : null,
                ];
            }),
            'voucher' => $voucherRequest && $voucherRequest->voucher ? [
                'code' => $voucherRequest->voucher->code,
                'status' => $voucherRequest->status,
                'discount_amount' => $voucherRequest->voucher->discount_amount,
                'type' => $voucherRequest->voucher->type,
            ] : null,
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

        DB::beginTransaction();

        try {
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

            // Create order items and reduce product quantity
            foreach ($request->cart as $item) {
                $product = Product::find($item['id']);

                if (!$product || !$product->is_active) {
                    DB::rollBack();
                    return response()->json(['message' => "Product not found or inactive."], 404);
                }

                if ($product->quantity < $item['quantity']) {
                    DB::rollBack();
                    return response()->json(['message' => "Not enough stock for {$product->name}."], 422);
                }

                // Create order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'unit_amount' => $item['price'],
                    'total_amount' => $item['price'] * $item['quantity'],
                ]);

                // Reduce product quantity
                $product->quantity -= $item['quantity'];
                $product->save();
            }

             // --- Voucher request logic ---
                if ($request->filled('voucher')) {
                    $voucher = \App\Models\Voucher::where('code', $request->voucher)->first();
                    if ($voucher) {
                        \App\Models\VoucherRequest::create([
                            'order_id' => $order->id,
                            'user_id' => $user->id,
                            'voucher_id' => $voucher->id,
                            'status' => 'pending',
                        ]);
                    }
                }

            DB::commit();

            return response()->json(['message' => 'Order placed successfully'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Something went wrong', 'error' => $e->getMessage()], 500);
        }
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