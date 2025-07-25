<?php
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\ApiProductController;
use App\Http\Controllers\ApiUserController;
use App\Http\Controllers\ApiOrderController;
use App\Http\Controllers\ApiCategoryController;
use App\Http\Controllers\ApiBrandController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Tightenco\Ziggy\Ziggy;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/ziggy.js', function () {
    return response()->json(new Ziggy);
})->name('ziggy');

// Authenticated and verified routes with role-based access control
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Users resource accessible only by admin
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);
    });

    // Products resource accessible by admin and staff
    Route::middleware('role:admin,staff')->group(function () {

      
        Route::get('/admin/products/{product}/adjust-stock', [ProductController::class, 'adjustStock'])->name('products.adjust-stock');
        Route::put('/admin/products/{product}/update-stock', [ProductController::class, 'updateStock'])->name('products.update-stock');
        Route::get('/products/{id}/image/{index?}', [ProductController::class, 'image'])->name('products.image');
        Route::put('/orders/{order}/mark-completed', [OrderController::class, 'markAsCompleted'])->name('orders.markAsCompleted');
        Route::get('/orders/archived', [OrderController::class, 'archived'])->name('orders.archived');
        Route::patch('/orders/{order}/unarchive', [OrderController::class, 'unarchive'])->name('orders.unarchive');
        Route::get('/products/voucher', function () {
        return Inertia::render('products/voucher');
        });
         Route::get('/products/voucher-list', function () {
        return Inertia::render('products/voucher-list');
        });
        Route::resource('products', ProductController::class);
        Route::resource('brands', BrandController::class);
        Route::resource('categories', CategoryController::class);
        Route::resource('orders', OrderController::class);
        Route::resource('addresses', AddressController::class);
    });
  
   

});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
