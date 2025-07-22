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
    $request->validate([
        'code' => 'required|string',
    ]);

    $voucher = \App\Models\Voucher::where('code', $request->code)
        ->where('active', true)
        ->where('expires_at', '>=', now())
        ->first();

    if (!$voucher) {
        return response()->json(['message' => 'Invalid or expired voucher.'], 400);
    }

    return response()->json([
        'voucher_id' => $voucher->id,
        'code' => $voucher->code,
        'type' => $voucher->type, // fixed or percent
        'discount_amount' => $voucher->discount_amount,
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
