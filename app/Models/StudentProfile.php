<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory;

    protected $table = 'tbl_student_profiles';

    protected $fillable = [
        'profileable_id',
        'profileable_type',
        'extension_name',
        'religion',
        'indigenous_people',
        'indigenous_type',
        'pwd',
        'pwd_type',
        'nationality',
        'place_of_birth',
        'mobile_number',
        'contact_number',
        'guardian_name',
        'relation',
        'house_no',
        'city_municipality',
        'province_state',
        'zip_code',
        'country',
        'height',
        'weight',
        'build',
        'eye_color',
        'hair_color',
        'father_last_name',
        'father_first_name',
        'father_middle_name',
        'father_extension_name',
        'mother_last_name',
        'mother_first_name',
        'mother_middle_name',
        'mother_extension_name',
        'guardian_last_name',
        'guardian_first_name',
        'guardian_middle_name',
        'guardian_extension_name',
    ];

    /**
     * Get the parent profileable model (Student).
     */
    public function profileable()
    {
        return $this->morphTo();
    }
}
