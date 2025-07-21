<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherRequest extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'voucher_id',
        'status',
        'admin_note',
    ];

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}