<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;


class VoucherController extends Controller
{
    public function index()
{
    return response()->json(\App\Models\Voucher::orderBy('created_at', 'desc')->get());
}
    public function store(Request $request)
{
    $request->validate([
        'code' => 'required|unique:vouchers,code',
        'discount_amount' => 'required|numeric|min:1',
        'type' => 'required|in:fixed,percent',
        'expires_at' => 'required|date',
        'active' => 'boolean',
    ]);

    $voucher = \App\Models\Voucher::create([
        'code' => $request->code,
        'discount_amount' => $request->discount_amount,
        'type' => $request->type,
        'expires_at' => $request->expires_at,
        'active' => $request->active ?? true,
    ]);

    return response()->json(['message' => 'Voucher created!', 'voucher' => $voucher], 201);
}

public function validateVoucher(Request $request)
{
    $code = $request->query('code'); // <-- explicitly get code from query string

    if (!$code) {
        return response()->json([
            'valid' => false,
            'message' => 'No voucher code provided.'
        ], 400);
    }

    $voucher = Voucher::where('code', $code)
        ->where('active', true)
        ->where('expires_at', '>=', now())
        ->where('used', 0)
        ->first();

    if (!$voucher) {
        return response()->json([
            'valid' => false,
            'message' => 'Invalid or expired voucher.'
        ], 200);
    }

    return response()->json([
        'valid' => true,
        'discount_amount' => $voucher->discount_amount,
        'type' => $voucher->type,
    ]);
}
public function updateStatus(Request $request, $id)
{
    $voucher = Voucher::findOrFail($id);
    $voucher->active = $request->active;
    $voucher->save();

    return response()->json(['message' => 'Status updated']);
}

public function destroy($id)
{
    try {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();

        return response()->json(['message' => 'Deleted']);
    } catch (\Exception $e) {
        \Log::error('Voucher delete error: ' . $e->getMessage());
        return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
    }
}
}
