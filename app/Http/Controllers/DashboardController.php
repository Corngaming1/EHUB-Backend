<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $latestOrders = Order::latest()->take(5)->get(['id', 'status', 'grand_total', 'created_at']);
        $stats = [
            'products' => Product::count(),
            'brands' => Brand::count(),
            'categories' => Category::count(),
        ];

        return Inertia::render('dashboard', [ // note lowercase 'dashboard' if your React file is lowercase
            'auth' => [
                'user' => Auth::user(),
            ],
            'latestOrders' => $latestOrders,
            'stats' => $stats,
        ]);
    }
}
