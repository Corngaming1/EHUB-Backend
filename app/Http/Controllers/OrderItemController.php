<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    /**
     * Store a newly created order item.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'unit_amount' => 'required|numeric|min:0',
        ]);

        // Check if the product already exists in the order
        $orderItem = OrderItem::where('order_id', $validated['order_id'])
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($orderItem) {
            // Update quantity and unit_amount if product exists
            $orderItem->quantity += $validated['quantity'];
            $orderItem->unit_amount = $validated['unit_amount']; // Update price if needed
            $orderItem->save();
        } else {
            // Create new order item
            OrderItem::create($validated);
        }

        return redirect()->route('orders.show', $validated['order_id'])
            ->with('success', 'Order item saved successfully.');
    }

    /**
     * Update the specified order item.
     */
    public function update(Request $request, OrderItem $orderItem)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'unit_amount' => 'required|numeric|min:0',
        ]);

        $orderItem->update($validated);

        return redirect()->route('orders.show', $orderItem->order_id)
            ->with('success', 'Order item updated successfully.');
    }

    /**
     * Remove the specified order item.
     */
    public function destroy(OrderItem $orderItem)
    {
        $orderId = $orderItem->order_id;
        $orderItem->delete();

        return redirect()->route('orders.show', $orderId)
            ->with('success', 'Order item deleted successfully.');
    }
}