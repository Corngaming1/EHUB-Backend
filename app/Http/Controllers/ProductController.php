<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'brand'])->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'images' => $product->images ?? [],
                'category' => $product->category?->only('id', 'name'),
                'brand' => $product->brand?->only('id', 'name'),
                'in_stock' => $product->in_stock,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'on_sale' => $product->on_sale,
                'quantity' => $product->quantity,
            ];
        });

        return Inertia::render('products/index', [
            'products' => $products,
        ]);
    }

    public function create()
    {
        return Inertia::render('products/create', [
            'categories' => \App\Models\Category::all(['id', 'name']),
            'brands' => \App\Models\Brand::all(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
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

        $imagesBase64 = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagesBase64[] = base64_encode(file_get_contents($image));
            }
        }

        $validated['images'] = $imagesBase64;

        Product::create($validated);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'brand']);

        return Inertia::render('products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'images' => $product->images ?? [],
                'category' => $product->category?->only('id', 'name'),
                'brand' => $product->brand?->only('id', 'name'),
                'in_stock' => $product->in_stock,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'on_sale' => $product->on_sale,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
                'quantity' => $product->quantity,
            ],
        ]);
    }

    public function edit(Product $product)
    {
        $product->load(['category', 'brand']);

        return Inertia::render('products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'images' => $product->images ?? [],
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'in_stock' => $product->in_stock,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'on_sale' => $product->on_sale,
                'quantity' => $product->quantity,
            ],
            'categories' => \App\Models\Category::all(['id', 'name']),
            'brands' => \App\Models\Brand::all(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'price' => 'nullable|numeric',
            'images.*' => 'nullable|image|max:2048',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'in_stock' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'on_sale' => 'boolean',
            'quantity' => 'required|integer|min:0',
        ]);

        if ($request->hasFile('images')) {
            $imagesBase64 = [];
            foreach ($request->file('images') as $image) {
                $imagesBase64[] = base64_encode(file_get_contents($image));
            }
            $validated['images'] = $imagesBase64;
        } else {
            $validated['images'] = $product->images ?? [];
        }

        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    // ✅ NEW: Serve base64 image via API
    public function image($id, $index = 0)
    {
        $product = Product::findOrFail($id);
        $images = $product->images ?? [];

        if (!isset($images[$index])) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $imageData = base64_decode($images[$index]);

        return Response::make($imageData, 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => 'inline; filename="product_' . $id . '_img' . $index . '.jpg"',
        ]);
    }
}