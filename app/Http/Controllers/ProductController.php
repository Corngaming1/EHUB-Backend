<?php


namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with(['category', 'brand'])->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                // Return images as array of URLs
                'images' => $product->images ? array_map(fn($img) => asset('storage/' . $img), $product->images) : [],
                'category' => $product->category ? $product->category->only('id', 'name') : null,
                'brand' => $product->brand ? $product->brand->only('id', 'name') : null,
                'in_stock' => $product->in_stock,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'on_sale' => $product->on_sale,
            ];
        });

        return Inertia::render('products/index', [
            'products' => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('products/create', [
            'categories' => \App\Models\Category::all(['id', 'name']),
            'brands' => \App\Models\Brand::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'images.*' => 'nullable|image|max:2048',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'in_stock' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'on_sale' => 'boolean',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('products', 'public');
            }
        }

        $validated['images'] = $imagePaths;

        Product::create($validated);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
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
                // Return images as array of URLs
                'images' => $product->images ? array_map(fn($img) => asset('storage/' . $img), $product->images) : [],
                'category' => $product->category ? $product->category->only('id', 'name') : null,
                'brand' => $product->brand ? $product->brand->only('id', 'name') : null,
                'in_stock' => $product->in_stock,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'on_sale' => $product->on_sale,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
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
                // Return images as array of URLs
                'images' => $product->images ? array_map(fn($img) => asset('storage/' . $img), $product->images) : [],
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'in_stock' => $product->in_stock,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'on_sale' => $product->on_sale,
            ],
                'categories' => \App\Models\Category::all(['id', 'name']),  // <-- add this
                 'brands' => \App\Models\Brand::all(['id', 'name']),          // <-- 
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
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
        ]);

        // If new images are uploaded, remove all old images from storage and replace
        if ($request->hasFile('images')) {
            // Delete all old images
            if (is_array($product->images)) {
                foreach ($product->images as $img) {
                    // Remove 'storage/' from asset() URL if needed
                    $imgPath = str_replace(asset('storage/'), '', $img);
                    \Storage::disk('public')->delete($imgPath);
                }
            }

            // Save new images
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('products', 'public');
            }
            $validated['images'] = $imagePaths;
        } else {
            // If no new images, keep the old ones
            $validated['images'] = $product->images ?? [];
        }

        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Delete all images from storage
        if (is_array($product->images)) {
            foreach ($product->images as $img) {
                $imgPath = str_replace(asset('storage/'), '', $img);
                \Storage::disk('public')->delete($imgPath);
            }
        }

        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }
}