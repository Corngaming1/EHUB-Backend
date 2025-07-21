<?php

namespace App\Http\Controllers;

use App\Models\VoucherRequest;
use App\Models\Voucher;
use Illuminate\Http\Request;

class AdminVoucherRequestController extends Controller
{
    // List all voucher requests
    public function index()
    {
        $requests = VoucherRequest::with(['user', 'order', 'voucher'])->orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }

    // Approve a voucher request
    public function approve($id, Request $request)
    {
        $voucherRequest = VoucherRequest::findOrFail($id);
        $voucherRequest->status = 'approved';
        $voucherRequest->admin_note = $request->input('admin_note');
        $voucherRequest->save();

        return response()->json(['message' => 'Voucher request approved.']);
    }

    // Reject a voucher request
    public function reject($id, Request $request)
    {
        $voucherRequest = VoucherRequest::findOrFail($id);
        $voucherRequest->status = 'rejected';
        $voucherRequest->admin_note = $request->input('admin_note');
        $voucherRequest->save();

        return response()->json(['message' => 'Voucher request rejected.']);
    }
}