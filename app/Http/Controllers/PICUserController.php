<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\BidangMagang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PICUserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $bidang = $request->input('bidang');

        $query = User::query()
            ->with('bidangMagang')
            ->where('role', 'pic');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
            });
        }

        if ($bidang && $bidang !== 'semua') {
            $query->where('bidang_magang_id', $bidang);
        }

        $picUsers = $query->paginate(10)->through(function (User $user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'bidang_magang_id' => $user->bidang_magang_id,
                'bidang_magang' => $user->bidangMagang?->nama_bidang,
                'status' => $user->status,
            ];
        });

        $bidangOptions = BidangMagang::active()
            ->get(['id', 'nama_bidang'])
            ->map(fn ($b) => ['value' => $b->id, 'label' => $b->nama_bidang]);

        return Inertia::render('pic/kelola/index', [
            'picUsers' => $picUsers,
            'bidangOptions' => $bidangOptions,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'bidang_magang_id' => ['nullable', 'exists:bidang_magangs,id'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'bidang_magang_id' => $data['bidang_magang_id'] ?? null,
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
            'bidang_magang_id' => ['nullable', 'exists:bidang_magangs,id'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $update = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'bidang_magang_id' => $data['bidang_magang_id'] ?? null,
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