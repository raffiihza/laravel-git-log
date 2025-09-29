<?php

namespace App\Http\Controllers;

use App\Models\Repository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RepositoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $repositories = Repository::all();
        
        return Inertia::render('Repositories/Index', [
            'repositories' => $repositories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Repositories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'git_log_path' => 'required|string',
            'description' => 'nullable|string',
        ]);

        Repository::create($validated);

        return redirect()->route('repositories.index')
            ->with('success', 'Repository created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Repository $repository)
    {
        return Inertia::render('Repositories/Show', [
            'repository' => $repository
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Repository $repository)
    {
        return Inertia::render('Repositories/Edit', [
            'repository' => $repository
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Repository $repository)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'git_log_path' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $repository->update($validated);

        return redirect()->route('repositories.index')
            ->with('success', 'Repository updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Repository $repository)
    {
        $repository->delete();

        return redirect()->route('repositories.index')
            ->with('success', 'Repository deleted successfully.');
    }
}
