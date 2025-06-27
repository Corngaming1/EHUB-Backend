<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ApiProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index(Request $request)
{
    $query = Product::with(['category', 'brand']);

    // Sorting logic
    switch ($request->query('sort')) {
        case 'az':
            $query->orderBy('name', 'asc');
            break;
        case 'priceLowHigh':
            $query->orderBy('price', 'asc');
            break;
        case 'priceHighLow':
            $query->orderBy('price', 'desc');
            break;
        case 'featured':
        $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
             break;    
        default:
            $query->orderBy('created_at', 'desc');
            break;
    }

    $products = $query->get()->map(function ($product) {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'stock' => $product->quantity,
            'price' => $product->price,
            'category' => $product->category,
            'image' => is_array($product->images) && count($product->images)
                ? 'data:image/*;base64,' . $product->images[0]
                : null,
        ];
    });

    return response()->json($products);
}
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified product.
     */
    public function show(string $id)
    {
        $product = Product::with(['category', 'brand'])->findOrFail($id);

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'stock' => $product->quantity,
            'price' => $product->price,
            'image' => is_array($product->images) && count($product->images)
                ? 'data:image/*;base64,' . $product->images[0]
                : null,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
    
}