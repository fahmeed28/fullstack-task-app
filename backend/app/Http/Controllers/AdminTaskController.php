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

//     public function update(Request $request, $id)
// {
//     // 1) Task dhoondo (user + category ke saath)
//     $task = Task::with(['user', 'category'])->find($id);

//     if (! $task) {
//         return response()->json([
//             'message' => 'Task not found'
//         ], 404);
//     }

//     // 2) Validation (sab optional / nullable)
//     $request->validate([
//         'title'       => 'sometimes|required|string|max:255',
//         'description' => 'sometimes|nullable|string',
//         'status'      => 'sometimes|required|in:pending,completed',
//         'category_id' => 'sometimes|required|exists:categories,id',
//     ]);

//     // 3) Jo field aayi hai sirf wohi update karo
//     if ($request->has('title')) {
//         $task->title = $request->title;
//     }

//     if ($request->has('description')) {
//         $task->description = $request->description;
//     }

//     if ($request->has('status')) {
//         $task->status = $request->status;
//     }

//     if ($request->has('category_id')) {
//         $task->category_id = $request->category_id;
//     }

//     $task->save();

//     // 4) Fresh data (relations ke saath) wapas bhej do
//     $task->load(['user', 'category']);

//     return response()->json([
//         'message' => 'Task updated successfully by admin.',
//         'task'    => $task,
//     ]);
// }

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
