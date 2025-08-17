<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand'])
            ->orderBy('created_at', 'desc');

   if ($request->has('search') && $request->search !== '') {
    $search = $request->search;

    $query->where(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%")
          ->orWhere('sku', $search); // exact match for SKU
    });
}

        $products = $query->paginate(20)
            ->through(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'sku' => $product->sku,
                    'description' => $product->description,
                    'price' => $product->price,
                    'images' => $product->images ?? [],
                    'category' => $product->category?->only('id', 'name'),
                    'brand' => $product->brand?->only('id', 'name'),
                    'in_stock' => $product->in_stock,
                    'is_active' => $product->is_active,
                    'is_featured' => $product->is_featured,
                    'on_sale' => $product->on_sale,
                    'discount_percentage' => $product->discount_percentage, // ← ADD THIS LINE
                    'quantity' => $product->quantity,
                ];
            });

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => $request->only('search'),
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
            'discount_percentage' => [
            'nullable',
            'numeric',
            'min:0',
            'max:100',
            function ($attribute, $value, $fail) use ($request) {
                if ($request->on_sale && ($value === null || $value === '')) {
                    $fail('Discount percentage is required when product is on sale.');
                }
            },
        ],
            'quantity' => 'required|integer|min:0',
        ]);

        $imagesBase64 = [];
        if ($request->hasFile('images')) {
            $manager = new ImageManager(new Driver());
            foreach ($request->file('images') as $image) {
                $compressed = $manager->read($image)
                    ->resize(800, null)
                    ->toJpeg(75); // 75% quality JPEG

                $imagesBase64[] = base64_encode((string) $compressed);
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
                'sku' => $product->sku,
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
                'discount_percentage' => $product->discount_percentage, 
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
                'sku' => $product->sku,
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
                'discount_percentage' => $product->discount_percentage,
                'quantity' => $product->quantity,
            ],
            'categories' => \App\Models\Category::all(['id', 'name']),
            'brands' => \App\Models\Brand::all(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
           $validated = $request->validate([
        'name' => 'required|string',
        'slug' => 'required|string',
        'sku' => 'required|string',
        'price' => 'required|numeric',
        'description' => 'nullable|string',
        'category_id' => 'nullable|exists:categories,id',
        'brand_id' => 'nullable|exists:brands,id',
        'is_active' => 'boolean',
        'in_stock' => 'boolean',
        'is_featured' => 'boolean',
        'on_sale' => 'boolean',
        'discount_percentage' => [
        'nullable',
        'numeric',
        'min:0',
        'max:100',
        function ($attribute, $value, $fail) use ($request) {
            if ($request->on_sale && ($value === null || $value === '')) {
                $fail('Discount percentage is required when product is on sale.');
            }
        },
    ],
        'quantity' => 'nullable|integer|min:0', // Make quantity optional
    ]);

       

            $product->update($validated);

        if ($request->hasFile('images')) {
            $imagesBase64 = [];
            $manager = new ImageManager(new Driver());
            foreach ($request->file('images') as $image) {
                $compressed = $manager->read($image)
                    ->resize(800, null)
                    ->toJpeg(75);

                $imagesBase64[] = base64_encode((string) $compressed);
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

    public function adjustStock(Product $product)
{
    return Inertia::render('Products/AdjustStock', [
        'product' => $product
    ]);
}

public function updateStock(Request $request, Product $product)
{
    $validated = $request->validate([
        'quantity' => 'required|integer|min:0'
    ]);

    $product->quantity = $validated['quantity'];
    $product->save();

    return redirect()->route('products.index')->with('success', 'Stock updated successfully.');
}
}