<?php
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AddressController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Tightenco\Ziggy\Ziggy;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/ziggy.js', function () {
    return response()->json(new Ziggy);
})->name('ziggy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('users', UserController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('brands', BrandController::class);
    Route::resource('products', ProductController::class);
    Route::resource('orders', OrderController::class);
    Route::resource('addresses', AddressController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
