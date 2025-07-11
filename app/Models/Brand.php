<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    //
    protected $fillable = ['name', 'slug', 'is_active', 'image'];
   
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
