<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PICUserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = User::query()
            ->where('role', 'pic');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
            });
        }

        $picUsers = $query->paginate(10)->through(function (User $user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
            ];
        });
        return Inertia::render('pic/kelola/index', [
            'picUsers' => $picUsers,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role' => 'pic',
            'status' => 'diterima',
            'email_verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'PIC berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        if ($user->role !== 'pic') {
            abort(403, 'Hanya dapat mengubah pengguna PIC');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $update = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ];

        if (!empty($data['password'])) {
            $update['password'] = $data['password'];
        }

        $user->update($update);

        return redirect()->back()->with('success', 'PIC berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'pic') {
            abort(403, 'Hanya dapat menghapus pengguna PIC');
        }

        $user->delete();

        return redirect()->back()->with('success', 'PIC berhasil dihapus');
    }
}
