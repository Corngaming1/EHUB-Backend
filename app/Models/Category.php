<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
      protected $fillable = [
        'user_id', // <-- this must be present!
        'id',
        'name',
        'slug',
        'image',
        'is_active',
    ];

       public function products()
    {
        return $this->hasMany(Product::class);
    }
}
