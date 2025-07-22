<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
        protected $fillable = [
       'user_id',
       'grand_total',
       'payment_method',
       'payment_status',
       'status',
       'currency',
       'shipping_amount',
       'shipping_method',
       'notes',
        'phone',       
        'location', 
        'archived', // New field added
         'voucher_code', 
         'address_id',
    ];
    
    protected $casts = [
        'archived' => 'boolean', // Cast archived to boolean
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

 public function items()
{
    return $this->hasMany(OrderItem::class);
}


    public function address()
    {
        return $this->hasOne(Address::class);
    }

    public function orders()
{
    return $this->hasMany(Order::class);
}

public function voucherRequests()
{
    return $this->hasMany(\App\Models\VoucherRequest::class);
}

public function voucher()
{
    return $this->belongsTo(\App\Models\Voucher::class);
}
}
