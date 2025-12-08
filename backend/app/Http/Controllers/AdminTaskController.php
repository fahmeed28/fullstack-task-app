<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Task;
use Illuminate\Support\Facades\Validator;

class AdminTaskController extends Controller
{
    // ALL TASKS (admin)
    public function index()
    {
        return Task::with(['user', 'category'])->get();
    }

    // Sigle task Show

    public function show($id)   // 👈 NEW
    {
        $task = Task::with(['user', 'category'])->find($id);

        if (! $task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        return response()->json($task);
    }


    // DELETE TASK (admin only)

    public function destroy($id)
    {
        $task = Task::find($id);

        if (! $task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully by admin'
        ]);
    }

    // Update
public function update(Request $request, $id)
{
    // 1) Task find
    $task = Task::with(['user', 'category'])->find($id);

    if (! $task) {
        return response()->json([
            'message' => 'Task not found'
        ], 404);
    }

    // 2) Manual validator (taake hamesha JSON hi mile)
    $validator = Validator::make($request->all(), [
        'title'       => 'sometimes|required|string|max:255',
        'description' => 'nullable|string',
        'status'      => 'sometimes|required|in:pending,completed',
        'category_id' => 'sometimes|exists:categories,id',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation error',
            'errors'  => $validator->errors(),
        ], 422);
    }

    // 3) Validated data lo
    $data = $validator->validated();

    // 4) Update task
    $task->update($data);

    // 5) Relationships dobara load
    $task->load(['user', 'category']);

    // 6) Success response
    return response()->json([
        'message' => 'Task updated successfully by admin.',
        'task'    => $task
    ]);
}


}
