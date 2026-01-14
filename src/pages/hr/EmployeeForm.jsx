import { useState, useEffect } from 'react'
import {
    User, Mail, Phone, Building2, Briefcase, MapPin,
    DollarSign, Calendar, Shield, FileText, Heart
} from 'lucide-react'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { ModalFooter } from '../../components/Modal'
import { createEmployee, updateEmployee } from '../../stores/hrStore'
import { useToast } from '../../components/Toast'

const employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' }
]

const workLocations = [
    { value: 'office', label: 'Office' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
]

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'on-leave', label: 'On Leave' },
    { value: 'terminated', label: 'Terminated' }
]

const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' }
]

function EmployeeForm({ employee, departments, onClose }) {
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [activeTab, setActiveTab] = useState('personal')

    const departmentOptions = departments.map(d => ({ value: d.name, label: d.name }))

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        address: '',
        department: '',
        position: '',
        employmentType: 'full-time',
        workLocation: 'office',
        hireDate: '',
        salary: '',
        manager: '',
        status: 'active',
        skills: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        bankAccountName: '',
        bankAccountNumber: '',
        bankName: ''
    })

    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                email: employee.email || '',
                phone: employee.phone || '',
                dateOfBirth: employee.dateOfBirth || '',
                gender: employee.gender || '',
                nationality: employee.nationality || '',
                address: employee.address || '',
                department: employee.department || '',
                position: employee.position || '',
                employmentType: employee.employmentType || 'full-time',
                workLocation: employee.workLocation || 'office',
                hireDate: employee.hireDate || '',
                salary: employee.salary?.toString() || '',
                manager: employee.manager || '',
                status: employee.status || 'active',
                skills: employee.skills?.join(', ') || '',
                emergencyContactName: employee.emergencyContact?.name || '',
                emergencyContactPhone: employee.emergencyContact?.phone || '',
                emergencyContactRelation: employee.emergencyContact?.relation || '',
                bankAccountName: employee.bankDetails?.accountName || '',
                bankAccountNumber: employee.bankDetails?.accountNumber || '',
                bankName: employee.bankDetails?.bankName || ''
            })
        }
    }, [employee])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (!formData.department) newErrors.department = 'Department is required'
        if (!formData.position.trim()) newErrors.position = 'Position is required'
        if (!formData.hireDate) newErrors.hireDate = 'Hire date is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            const data = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                nationality: formData.nationality,
                address: formData.address,
                department: formData.department,
                position: formData.position,
                employmentType: formData.employmentType,
                workLocation: formData.workLocation,
                hireDate: formData.hireDate,
                salary: parseFloat(formData.salary) || 0,
                manager: formData.manager || null,
                status: formData.status,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                emergencyContact: {
                    name: formData.emergencyContactName,
                    phone: formData.emergencyContactPhone,
                    relation: formData.emergencyContactRelation
                },
                bankDetails: {
                    accountName: formData.bankAccountName,
                    accountNumber: formData.bankAccountNumber,
                    bankName: formData.bankName
                }
            }

            if (employee) {
                updateEmployee(employee.id, data)
                toast.success('Employee updated successfully')
            } else {
                createEmployee(data)
                toast.success('Employee added successfully')
            }
            onClose(true)
        } catch (error) {
            toast.error('Failed to save employee')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'employment', label: 'Employment', icon: Briefcase },
        { id: 'compensation', label: 'Compensation', icon: DollarSign },
        { id: 'emergency', label: 'Emergency', icon: Heart },
    ]

    return (
        <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <div className="form-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`form-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
                <div className="form-grid">
                    <FormInput
                        label="First Name *"
                        icon={User}
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        error={errors.firstName}
                    />
                    <FormInput
                        label="Last Name *"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        error={errors.lastName}
                    />
                    <FormInput
                        label="Email *"
                        icon={Mail}
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email}
                    />
                    <FormInput
                        label="Phone"
                        icon={Phone}
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                    <FormInput
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    />
                    <FormSelect
                        label="Gender"
                        options={genders}
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                    />
                    <FormInput
                        label="Nationality"
                        value={formData.nationality}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                    />
                    <FormInput
                        label="Address"
                        icon={MapPin}
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                    />
                </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
                <div className="form-grid">
                    <FormSelect
                        label="Department *"
                        options={departmentOptions}
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        error={errors.department}
                    />
                    <FormInput
                        label="Position *"
                        icon={Briefcase}
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        error={errors.position}
                    />
                    <FormSelect
                        label="Employment Type"
                        options={employmentTypes}
                        value={formData.employmentType}
                        onChange={(e) => handleChange('employmentType', e.target.value)}
                    />
                    <FormSelect
                        label="Work Location"
                        options={workLocations}
                        value={formData.workLocation}
                        onChange={(e) => handleChange('workLocation', e.target.value)}
                    />
                    <FormInput
                        label="Hire Date *"
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => handleChange('hireDate', e.target.value)}
                        error={errors.hireDate}
                    />
                    <FormSelect
                        label="Status"
                        options={statuses}
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                    />
                    <div className="form-field full-width">
                        <FormTextarea
                            label="Skills (comma separated)"
                            value={formData.skills}
                            onChange={(e) => handleChange('skills', e.target.value)}
                            placeholder="React, Python, Leadership, ..."
                            rows={2}
                        />
                    </div>
                </div>
            )}

            {/* Compensation Tab */}
            {activeTab === 'compensation' && (
                <div className="form-grid">
                    <FormInput
                        label="Annual Salary"
                        icon={DollarSign}
                        type="number"
                        value={formData.salary}
                        onChange={(e) => handleChange('salary', e.target.value)}
                        placeholder="e.g., 75000"
                    />
                    <div /> {/* Spacer */}
                    <FormInput
                        label="Bank Account Name"
                        value={formData.bankAccountName}
                        onChange={(e) => handleChange('bankAccountName', e.target.value)}
                    />
                    <FormInput
                        label="Bank Name"
                        value={formData.bankName}
                        onChange={(e) => handleChange('bankName', e.target.value)}
                    />
                    <FormInput
                        label="Account Number"
                        value={formData.bankAccountNumber}
                        onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                    />
                </div>
            )}

            {/* Emergency Contact Tab */}
            {activeTab === 'emergency' && (
                <div className="form-grid">
                    <FormInput
                        label="Contact Name"
                        icon={User}
                        value={formData.emergencyContactName}
                        onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                    />
                    <FormInput
                        label="Contact Phone"
                        icon={Phone}
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                    />
                    <FormInput
                        label="Relationship"
                        value={formData.emergencyContactRelation}
                        onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                        placeholder="e.g., Spouse, Parent, Sibling"
                    />
                </div>
            )}

            <ModalFooter>
                <button type="button" className="btn-secondary" onClick={() => onClose(false)} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : (employee ? 'Update Employee' : 'Add Employee')}
                </button>
            </ModalFooter>

            <style>{`
        .form-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .form-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .form-tab:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .form-tab.active {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .form-field.full-width {
          grid-column: span 2;
        }

        .btn-primary {
          padding: 12px 24px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: white;
          font-weight: 500;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }
      `}</style>
        </form>
    )
}

export default EmployeeForm
