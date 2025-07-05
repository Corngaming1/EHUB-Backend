<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

    $query = Category::select('id', 'name', 'slug', 'image', 'is_active')
        ->orderBy('created_at', 'desc');

    if ($request->has('search') && $request->search !== '') {
        $query->where('name', 'like', '%' . $request->search . '%');
    }

    $categories = $query->paginate(10)
        ->through(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image ?: null,
                'is_active' => $category->is_active,
            ];
        });

    return Inertia::render('categories/index', [
        'categories' => $categories,
        'filters' => $request->only('search'),
    ]);
}

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        // Handle image upload if present
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        // Assign the authenticated user's ID
        $validated['user_id'] = $request->user()->id;

        Category::create($validated);

        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }

/**
 * Show the form for editing the specified resource.
 */
public function edit(Category $category)
{
    return Inertia::render('categories/edit', [
        'category' => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'image' => $category->image ?: null,
            'is_active' => $category->is_active,
        ],
    ]);
}


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        \Log::info('UPDATE DATA', $request->all());
        \Log::info('HAS FILE', [$request->hasFile('image')]);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        // Ensure is_active is always set (default to false)
        $validated['is_active'] = $request->has('is_active') ? $request->boolean('is_active') : false;

        // Handle image upload if new image provided, else keep old image path
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        } else {
            $validated['image'] = $category->image;
        }

        \Log::info('VALIDATED DATA', $validated);

        $category->update($validated);

        \Log::info('UPDATED CATEGORY', $category->toArray());

        return redirect()->route('categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
    }
}