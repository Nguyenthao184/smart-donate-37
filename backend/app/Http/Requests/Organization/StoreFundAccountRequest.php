<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class StoreFundAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ten_quy' => [
                'required',
                'string',
                'min:5',
                'max:255',
                'regex:/^[\pL\s0-9]+$/u'
            ],
        ];
    }

    public function messages()
    {
        return [
            'ten_quy.required' => 'Tên quỹ bắt buộc',
            'ten_quy.min' => 'Tên quỹ tối thiểu 5 ký tự',
            'ten_quy.regex' => 'Tên quỹ không hợp lệ',
        ];
    }
}
