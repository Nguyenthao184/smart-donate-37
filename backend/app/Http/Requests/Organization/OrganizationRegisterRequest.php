<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrganizationRegisterRequest extends FormRequest
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
            'ten_to_chuc' => [
                'required',
                'string',
                'min:5',
                'max:255',
                'regex:/^[\pL0-9\s\.\,\-\&]+$/u'
            ],

            'ma_so_thue' => [
                'nullable',
                'digits_between:10,13',
                Rule::unique('xac_minh_to_chuc', 'ma_so_thue')
            ],

            'nguoi_dai_dien' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[\pL\s]+$/u'
            ],
            
            'giay_phep' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'ten_to_chuc.required' => 'Tên tổ chức không được để trống',
            'ten_to_chuc.min' => 'Tên tổ chức phải ít nhất 5 ký tự',
            'ten_to_chuc.max' => 'Tên tổ chức không vượt quá 255 ký tự',
            'ten_to_chuc.regex' => 'Tên tổ chức chứa ký tự không hợp lệ',

            'ma_so_thue.digits_between' => 'Mã số thuế phải từ 10 đến 13 chữ số',
            'ma_so_thue.unique' => 'Mã số thuế đã tồn tại trong hệ thống',

            'nguoi_dai_dien.required' => 'Vui lòng nhập người đại diện',
            'nguoi_dai_dien.min' => 'Tên người đại diện phải ít nhất 3 ký tự',
            'nguoi_dai_dien.max' => 'Tên người đại diện không vượt quá 255 ký tự',
            'nguoi_dai_dien.regex' => 'Người đại diện chỉ được chứa chữ cái và khoảng trắng',

            'giay_phep.required' => 'Vui lòng cung cấp giấy phép',
            'giay_phep.file' => 'Giấy phép phải là một tệp tin',
            'giay_phep.mimes' => 'Giấy phép phải là file PDF, JPG hoặc PNG',
            'giay_phep.max' => 'Kích thước file giấy phép không được vượt quá 2MB',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {

            // Không cho đăng ký nhiều lần
            $exists = \App\Models\XacMinhToChuc::where('nguoi_dung_id', auth()->id())
                ->whereIn('trang_thai', ['CHO_XU_LY', 'CHAP_NHAN'])
                ->exists();

            if ($exists) {
                $validator->errors()->add('ten_to_chuc', 'Bạn đã gửi yêu cầu đăng ký trước đó');
            }

        });
    }

    // Chuẩn hoá input
    protected function prepareForValidation()
    {
        $this->merge([
            'ten_to_chuc' => trim($this->ten_to_chuc),
            'nguoi_dai_dien' => trim($this->nguoi_dai_dien),
        ]);
    }
}
