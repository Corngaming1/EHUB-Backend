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
}
