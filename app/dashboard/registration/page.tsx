"use client"

import { useState } from 'react';
import React from 'react';
import { CheckCircle, Upload } from 'lucide-react';

// Define the shape of the API response for type safety
interface ApiResponse {
  status: number;
  message: string;
  token?: string;
  user?: any;
}

// Define the shape of the status state
interface StatusState {
  type: 'success' | 'error' | '';
  message: string;
}

// Main component for the registration form
const RegistrationForm = () => {
  // State to hold the form data
  const [formData, setFormData] = useState({
    // Common fields
    username: '',
    email: '',
    password: '',
    role_id: 5, // Default to Student role
    full_name: '',
    dob: '',
    gender: 'Male', // Default gender
    blood_group: '',
    nationality: '',
    religion_caste: '',
    mother_tongue: '',
    permanent_address: '',
    correspondence_address: '',
    aadhaar_number: '',
    health_details: '',
    school_id: '1', // Mock school ID
    phone: '',

    // Student-specific fields
    previous_school: '',
    class_for_admission: '',
    class_id: '',
    admission_date: '',
    roll_number: '',
    guardian_name: '',
    
    // Parent-specific fields
    father_name: '',
    father_qualification: '',
    father_occupation: '',
    father_contact: '',
    mother_name: '',
    mother_qualification: '',
    mother_occupation: '',
    mother_contact: '',
    annual_income: '',
    parent_address_proof: '',
    parent_email: '',
    emergency_contact: '',
    student_id: '',
  });

  // State to handle file uploads, mapped by document name
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Record<string, File | null>>({});
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  // State to manage the form's submission status and messages
  const [status, setStatus] = useState<StatusState>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Function to handle changes to text/select inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to handle profile photo file input change
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfilePhoto(file);
    if (file) {
      setProfilePhotoPreview(URL.createObjectURL(file));
    } else {
      setProfilePhotoPreview(null);
    }
  };

  // Function to handle individual document file input change
  const handleDocumentChange = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDocuments(prevDocs => ({
      ...prevDocs,
      [docName]: file,
    }));
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // Construct the payload based on the selected role
    let payload: any = {
      // Common fields
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role_id: Number(formData.role_id),
      full_name: formData.full_name,
      gender: formData.gender,
      dob: formData.dob,
      permanent_address: formData.permanent_address,
      correspondence_address: formData.correspondence_address,
      phone: formData.phone,
      school_id: formData.school_id,
      profile_photo: profilePhoto ? profilePhoto.name : null,
      aadhaar_number: formData.aadhaar_number,
      health_details: formData.health_details,
    };

    // Add role-specific fields to the payload
    if (payload.role_id === 5) { // Student
      payload = {
        ...payload,
        blood_group: formData.blood_group,
        nationality: formData.nationality,
        religion_caste: formData.religion_caste,
        mother_tongue: formData.mother_tongue,
        previous_school: formData.previous_school,
        class_for_admission: formData.class_for_admission,
        class_id: formData.class_id,
        admission_date: formData.admission_date,
        roll_number: formData.roll_number,
        guardian_name: formData.guardian_name,
        documents: Object.keys(documents).filter(key => documents[key] !== null),

        // Parent details
        father_name: formData.father_name,
        father_qualification: formData.father_qualification,
        father_occupation: formData.father_occupation,
        father_contact: formData.father_contact,
        mother_name: formData.mother_name,
        mother_qualification: formData.mother_qualification,
        mother_occupation: formData.mother_occupation,
        mother_contact: formData.mother_contact,
        annual_income: formData.annual_income,
        parent_address_proof: formData.parent_address_proof,
        parent_email: formData.parent_email,
        emergency_contact: formData.emergency_contact,
      };
    } else if (payload.role_id === 6) { // Parent
      payload = {
        ...payload,
        student_id: formData.student_id,
      };
    }

    try {
      // NOTE: Replace this with your actual API endpoint.
      // This is a mock API call to demonstrate functionality.
      const response: ApiResponse = await new Promise(resolve => setTimeout(() => {
        // Simulate a successful registration
        if (formData.username === 'test' || formData.email === 'test@example.com') {
          resolve({ status: 0, message: 'Username or email already exists.' });
        } else {
          resolve({ status: 1, message: 'User registered successfully!', token: 'mock-token-123', user: { ...payload, id: '123' } });
        }
      }, 1500));

      if (response.status === 1) {
        setStatus({ type: 'success', message: response.message });
      } else {
        setStatus({ type: 'error', message: response.message });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const documentList = [
    { name: 'Birth Certificate', required: true, category: 'Mandatory' },
    { name: 'Previous School Transfer Certificate', required: true, category: 'Mandatory' },
    { name: 'Previous Class Marksheet', required: true, category: 'Mandatory' },
    { name: 'Aadhaar Card (Student + Parents)', required: true, category: 'Mandatory' },
    { name: 'Passport-size Photographs', required: true, category: 'Mandatory' },
    { name: 'Address Proof of Parents', required: true, category: 'Mandatory' },
    { name: 'Caste Certificate', required: false, category: 'Category/Quota' },
    { name: 'Income Certificate', required: false, category: 'Category/Quota' },
    { name: 'Domicile Certificate', required: false, category: 'Category/Quota' },
    { name: 'Medical Fitness Certificate', required: false, category: 'Medical/Health' },
    { name: 'Vaccination/Immunization Record', required: false, category: 'Medical/Health' },
    { name: 'Disability Certificate', required: false, category: 'Medical/Health' },
    { name: 'Parent\'s ID Proof', required: false, category: 'Other' },
    { name: 'Bank Passbook copy', required: false, category: 'Other' },
  ];

  // Render the form
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden transform transition-all duration-300">
        <div className="p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-neutral-900 dark:text-neutral-50 mb-2 sm:mb-4">
            New Registration
          </h1>
          <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm sm:text-base mb-8">
            Please fill out the form to register a new user.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Common fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Role</label>
                <select name="role_id" value={formData.role_id} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50">
                  <option value="5">Student</option>
                  <option value="6">Parent</option>
                  <option value="3">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">School ID</label>
                <input type="text" name="school_id" value={formData.school_id} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
              </div>
            </div>

            {/* Profile Photo Upload Section */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Profile Photo</h3>
              <div className="flex flex-col items-center space-y-4">
                {profilePhotoPreview && (
                  <img src={profilePhotoPreview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-2 border-neutral-300 dark:border-neutral-600 shadow-md" />
                )}
                <label className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition duration-150">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Profile Photo
                  <input type="file" onChange={handleProfilePhotoChange} className="hidden" accept="image/*" />
                </label>
                {profilePhoto && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{profilePhoto.name} selected</span>
                )}
              </div>
            </div>

            {/* Conditional fields for students */}
            {Number(formData.role_id) === 5 && (
              <>
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Student Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Blood Group</label>
                      <input type="text" name="blood_group" value={formData.blood_group} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nationality</label>
                      <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Religion / Caste</label>
                      <input type="text" name="religion_caste" value={formData.religion_caste} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mother Tongue</label>
                      <input type="text" name="mother_tongue" value={formData.mother_tongue} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Previous School Name</label>
                      <input type="text" name="previous_school" value={formData.previous_school} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Class for Admission</label>
                      <input type="text" name="class_for_admission" value={formData.class_for_admission} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Health / Medical Details</label>
                      <textarea name="health_details" value={formData.health_details} onChange={handleChange} rows={3} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Permanent Address</label>
                      <input type="text" name="permanent_address" value={formData.permanent_address} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Correspondence Address</label>
                      <input type="text" name="correspondence_address" value={formData.correspondence_address} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                  </div>
                </div>

                {/* Parent / Guardian Details Section */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Parent / Guardian Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Father's Name</label>
                      <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Father's Qualification</label>
                      <input type="text" name="father_qualification" value={formData.father_qualification} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Father's Occupation</label>
                      <input type="text" name="father_occupation" value={formData.father_occupation} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Father's Contact No.</label>
                      <input type="tel" name="father_contact" value={formData.father_contact} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mother's Name</label>
                      <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mother's Qualification</label>
                      <input type="text" name="mother_qualification" value={formData.mother_qualification} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mother's Occupation</label>
                      <input type="text" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mother's Contact No.</label>
                      <input type="tel" name="mother_contact" value={formData.mother_contact} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Annual Income</label>
                      <input type="text" name="annual_income" value={formData.annual_income} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Address Proof</label>
                      <input type="text" name="parent_address_proof" value={formData.parent_address_proof} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Parent's Email ID</label>
                      <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Emergency Contact</label>
                      <input type="tel" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50" />
                    </div>
                  </div>
                </div>

                {/* Student Documents Section */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Documents to be Submitted</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Please upload the required documents.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                      <thead className="bg-neutral-100 dark:bg-neutral-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Document
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Upload</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                        {documentList.map((doc, index) => (
                          <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-850">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-50">
                              {doc.name} {doc.required && <span className="text-red-500">*</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {documents[doc.name] ? (
                                <CheckCircle className="text-green-500 w-5 h-5" />
                              ) : (
                                <span className="text-neutral-400 dark:text-neutral-600">Pending</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-neutral-50 bg-neutral-900 dark:bg-neutral-50 hover:bg-neutral-800 dark:hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer transition duration-150">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                                <input
                                  type="file"
                                  onChange={(e) => handleDocumentChange(doc.name, e)}
                                  className="hidden"
                                />
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Conditional field for parents */}
            {Number(formData.role_id) === 6 && (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Parent Details</h3>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    required={Number(formData.role_id) === 6}
                    className="mt-1 block w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition duration-150 text-neutral-900 dark:text-neutral-50"
                  />
                </div>
              </div>
            )}

            {/* Submission button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-neutral-50 transition duration-200 ${loading
                    ? 'bg-neutral-400 dark:bg-neutral-600 cursor-not-allowed'
                    : 'bg-neutral-900 dark:bg-neutral-50 hover:bg-neutral-800 dark:hover:bg-neutral-200'
                  }`}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>

            {/* Status message display */}
            {status.message && (
              <div
                className={`text-center p-3 rounded-md mt-4 transition duration-300 ${status.type === 'success'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-rose-200'
                  }`}
              >
                {status.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
