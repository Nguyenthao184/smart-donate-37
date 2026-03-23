<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('loai_bai') && is_string($this->loai_bai)) {
            $this->merge([
                'loai_bai' => strtoupper(trim($this->loai_bai)),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'loai_bai' => 'required|in:CHO,NHAN',
            'danh_muc_id' => 'nullable|exists:danh_muc,id',
            'tieu_de' => 'required|string|max:255',
            'mo_ta' => 'required|string|max:255',
            'hinh_anh' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
            'dia_diem' => 'required|string|max:255',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'so_luong' => 'required|integer|min:1',

            'trang_thai' => 'nullable|in:CON_NHAN,CON_TANG,DA_NHAN,DA_TANG',
        ];
    }

    public function messages(): array
    {
        return [
            'loai_bai.required' => 'Vui lòng chọn loại bài (CHO hoặc NHAN).',
            'so_luong.min' => 'Số lượng phải >= 1.',
        ];
    }
}

