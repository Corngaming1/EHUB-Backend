<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiProductController;
use App\Http\Controllers\ApiUserController;
use App\Http\Controllers\ApiOrderController;
use App\Http\Controllers\ApiCategoryController;
use App\Http\Controllers\ApiBrandController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\AdminVoucherRequestController;
use App\Http\Controllers\VoucherController;

Route::get('products/suggestions', [ApiProductController::class, 'suggestions']);
Route::apiResource('users', ApiUserController::class);
Route::apiResource('apiorders', ApiOrderController::class);
Route::apiResource('apicategories', ApiCategoryController::class);
Route::apiResource('brands', ApiBrandController::class);
Route::apiResource('apiproducts', ApiProductController::class);
Route::apiResource('addresses', AddressController::class);
Route::post('/admin/vouchers', [VoucherController::class, 'store']);
Route::get('/admin/vouchers', [VoucherController::class, 'index']);
Route::post('/validate-voucher', [VoucherController::class, 'validateVoucher']);
Route::patch('/admin/vouchers/{id}', [VoucherController::class, 'updateStatus']);
Route::delete('/admin/vouchers/{id}', [VoucherController::class, 'destroy']);