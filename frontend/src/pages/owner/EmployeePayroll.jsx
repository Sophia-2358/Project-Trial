import { useState } from 'react'
import OwnerLayout  from '../../components/OwnerLayout'
import OwnerMessage from '../../components/OwnerMessage'

// 2.3.1 wage computation
import { EMPTY_FORM, applyFieldChange, computeWage, useEmployees, PayrollEntryFields, WageComputationCard }
    from '../../components/WageComputation'
// 2.3.2 payroll validation and saving
import { validatePayroll, savePayrollRecord, usePayrollRecords, SavePayrollButton, PayrollRecordsTable }
    from '../../components/PayrollValidationSaving'

export default function EmployeePayroll() {
    const [form, setForm] = useState(EMPTY_FORM)
    const [msg, setMsg]   = useState(null)

    const { employees, error: employeesError } = useEmployees()
    const { records, error: recordsError, reload } = usePayrollRecords()

    // Show gross, deductions and net while the Owner types.
    const wage = computeWage(form)

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => applyFieldChange(prev, name, value, employees))
    }

    // Check the form and save one weekly payroll record.
    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await savePayrollRecord(validatePayroll(form))
            setMsg({ text: 'Payroll record saved.', ok: true })
            setForm(EMPTY_FORM)
            reload()
        } catch (err) {
            setMsg({ text: err.message, ok: false })
        }
    }

    const loadError = employeesError || recordsError

    return (
        <OwnerLayout active="employee-payroll">
            <div className="em-top">
                <div>
                    <h1>Weekly payroll</h1>
                    <p className="em-sub">Enter work hours, rate and deductions to compute the week's wages</p>
                </div>
            </div>

            <OwnerMessage msg={msg ?? (loadError ? { text: loadError, ok: false } : null)} />

            <form id="payrollForm" className="em-row em-no-print" onSubmit={handleSubmit}>
                <PayrollEntryFields form={form} employees={employees} onChange={handleChange} />

                <div style={{ flex: 1 }}>
                    <WageComputationCard wage={wage} />
                    <SavePayrollButton />
                </div>
            </form>

            <PayrollRecordsTable records={records} />
        </OwnerLayout>
    )
}
