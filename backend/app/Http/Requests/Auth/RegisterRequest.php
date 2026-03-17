<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-zÀ-ỹ]+( [A-Za-zÀ-ỹ]+)*$/'
            ],
            'ten_tai_khoan' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-z0-9]+$/',
                'unique:nguoi_dung,ten_tai_khoan'
            ],
            'email' => 'required|email|unique:nguoi_dung,email',
            'password' => 'required|min:6'
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
            'ten_tai_khoan.regex' => 'Tên tài khoản chỉ được chứa chữ cái và số, không được chứa ký tự đặc biệt.',
            'ten_tai_khoan.unique' => 'Tên tài khoản đã tồn tại trong hệ thống.',

            'email.required' => 'Email không được để trống.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email đã tồn tại trong hệ thống.',

            'password.required' => 'Mật khẩu không được để trống.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
        ];
    }
}
