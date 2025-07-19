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
    if ($request->has('search') && $request->search !== '') {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%$search%")
            ->orWhere('description', 'like', "%$search%")
             ->orWhere('sku', 'like', "%$search%");
        });
    }

    if ($request->has('category') && $request->category !== 'ALL') {
    $query->whereHas('category', function ($q) use ($request) {
        $q->where('name', $request->category);
    });
}

      $products = $query->paginate(12);

 $products->getCollection()->transform(function ($product) {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku, 
            'description' => $product->description,
            'stock' => $product->quantity,
            'price' => $product->price,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'images' => is_array($product->images)
                ? array_map(fn($img) => 'data:image/*;base64,' . $img, $product->images)
                : [],
        ];
    });

    return response()->json($products);
}

/**
 * Store a newly created resource in storage.
 */
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'slug' => 'required|string|max:255|unique:products,slug',
        'sku' => 'nullable|string|unique:products,sku',
        'description' => 'nullable|string',
        'price' => 'required|numeric',
        'images.*' => 'nullable|image|max:2048',
        'category_id' => 'required|exists:categories,id',
        'brand_id' => 'nullable|exists:brands,id',
        'in_stock' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'on_sale' => 'boolean',
        'quantity' => 'required|integer|min:0',
    ]);

    $product = Product::create($validated);

    return response()->json([
        'message' => 'Product created successfully.',
        'product' => $product,
    ], 201);
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
            'sku' => $product->sku, 
            'description' => $product->description,
            'stock' => $product->quantity,
            'price' => $product->price,
            'images' => is_array($product->images)
    ? array_map(fn($img) => 'data:image/*;base64,' . $img, $product->images)
    : [],

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

    public function suggestions(Request $request)
{
    $query = Product::query();

    if ($request->has('search') && $request->search !== '') {
        $search = $request->search;
        $query->where('name', 'like', "%$search%");
    }

    // Limit to 10 suggestions for performance
    $names = $query->limit(10)->pluck('name');

    return response()->json($names);
}
    
}