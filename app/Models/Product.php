<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
   protected $fillable = ['name', 'slug', 'images', 'is_active', 'description', 'brand_id', 'category_id', 'price', 'is_featured', 'in_stock', 'on_sale'];

    protected $casts = ['images' => 'array'];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // Product belongs to one brand
    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    protected static function booted()
{
    static::updated(function ($product) {
        if ($product->isDirty('price')) {
            // Update all order items with this product
            $orderItems = \App\Models\OrderItem::where('product_id', $product->id)->get();

            foreach ($orderItems as $item) {
                $item->price = $product->price;
                $item->save();

                // Recalculate order grand total
                $order = $item->order;
                $order->grand_total = $order->items()->sum(\DB::raw('quantity * price'));
                $order->save();
            }
        }
    });
}
}
