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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('users', UserController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('brands', BrandController::class);
    Route::resource('products', ProductController::class);
    Route::resource('orders', OrderController::class);
    Route::resource('addresses', AddressController::class);

});

Route::prefix('api')->middleware('api')->group(function () {
    Route::apiresource('apiusers', ApiUserController::class);
    Route::apiresource('apicategories', ApiCategoryController::class);
    Route::apiresource('apibrands', ApiBrandController::class);
    Route::apiResource('apiproducts', ApiProductController::class); 
    Route::apiresource('apiorders', ApiOrderController::class);
    Route::apiresource('addresses', AddressController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
