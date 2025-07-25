<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'code',
        'discount_amount',
        'type',
        'expires_at',
        'active',
        'used',
    ];

    public function requests()
    {
        return $this->hasMany(VoucherRequest::class);
    }
}