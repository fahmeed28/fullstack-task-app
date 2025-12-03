<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;


class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    // sirf current logged-in user ke tasks
    $tasks = Task::where('user_id', Auth::id())->get();

    return response()->json($tasks);
}


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $request->validate([
        'category_id' => 'required|exists:categories,id',
        'title'       => 'required',
        'description' => 'nullable',
        'status'      => 'required|in:pending,completed',
    ]);

    $task = Task::create([
        'user_id'     => Auth::id(),           // 👈 token se user id
        'category_id' => $request->category_id,
        'title'       => $request->title,
        'description' => $request->description,
        'status'      => $request->status,
    ]);

    return response()->json($task, 201);
}


    /**
     * Display the specified resource.
     */
   public function show(string $id)
{
    // sirf current user ka task id se dhundo
    $task = Task::where('id', $id)
        ->where('user_id', Auth::id())
        ->first();

    if (! $task) {
        return response()->json([
            'message' => 'Task not found'
        ], 404);
    }

    return response()->json($task);
}


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
   public function update(Request $request, string $id)
{
    // 1) Pehle check karo ke yeh task current user ka hi hai
    $task = Task::where('id', $id)
        ->where('user_id', Auth::id())
        ->first();

    if (! $task) {
        return response()->json([
            'message' => 'Task not found'
        ], 404);
    }

    // 2) Validation
    $request->validate([
        'category_id' => 'required|exists:categories,id',
        'title'       => 'required',
        'description' => 'nullable',
        'status'      => 'required|in:pending,completed',
    ]);

    // 3) Update
    $task->update([
        'category_id' => $request->category_id,
        'title'       => $request->title,
        'description' => $request->description,
        'status'      => $request->status,
    ]);

    // 4) Response
    return response()->json([
        'message' => 'Task updated successfully',
        'task'    => $task,
    ]);
}

    /**
     * Remove the specified resource from storage.
     */
   public function destroy(string $id)
{
    // Sirf current user ka task dhundo
    $task = Task::where('id', $id)
        ->where('user_id', Auth::id())
        ->first();

    if (! $task) {
        return response()->json([
            'message' => 'Task not found'
        ], 404);
    }

    // Mil gaya to delete
    $task->delete();

    return response()->json([
        'message' => 'Task deleted successfully'
    ]);
}

}
