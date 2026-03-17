<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ho_ten' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[A-Za-zÀ-ỹ]+( [A-Za-zÀ-ỹ]+)*$/'
            ],
            'ten_tai_khoan' => [
                'sometimes',
                'string',
                'max:50',
                'regex:/^[a-z0-9]+$/',
                Rule::unique('nguoi_dung','ten_tai_khoan')->ignore(auth()->id())
            ],
            'email' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
                Rule::unique('nguoi_dung','email')->ignore(auth()->id())
            ],
            'anh_dai_dien' => [
                'sometimes',
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'ho_ten.required' => 'Họ tên không được để trống.',
            'ho_ten.string' => 'Họ tên phải là chuỗi ký tự.',
            'ho_ten.max' => 'Họ tên không được vượt quá 255 ký tự.',
            'ho_ten.regex' => 'Họ tên chỉ được chứa chữ cái và mỗi từ cách nhau đúng 1 dấu cách.',

            'ten_tai_khoan.required' => 'Tên tài khoản không được để trống.',
            'ten_tai_khoan.string' => 'Tên tài khoản phải là chuỗi ký tự.',
            'ten_tai_khoan.max' => 'Tên tài khoản không được vượt quá 50 ký tự.',
            'ten_tai_khoan.regex' => 'Tên tài khoản chỉ được chứa chữ cái và số.',
            'ten_tai_khoan.unique' => 'Tên tài khoản đã tồn tại trong hệ thống.',

            'email.required' => 'Email không được để trống.',
            'email.regex' => 'Email không đúng định dạng.',
            'email.unique' => 'Email đã tồn tại trong hệ thống.',

            'anh_dai_dien.image' => 'Ảnh đại diện phải là file hình ảnh.',
            'anh_dai_dien.mimes' => 'Ảnh đại diện chỉ được định dạng jpg, jpeg, png.',
            'anh_dai_dien.max' => 'Ảnh đại diện không được lớn hơn 2MB.',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'email' => $this->email ? trim($this->email) : null,
            'ten_tai_khoan' => $this->ten_tai_khoan ? trim($this->ten_tai_khoan) : null,
            'ho_ten' => $this->ho_ten ? trim($this->ho_ten) : null,
        ]);
    }
}
