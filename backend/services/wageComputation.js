export const round2 = (n) => Math.round(n * 100) / 100;

// ==========================================
// 2.3.1 — WAGE COMPUTATION
// gross      = work hours x rate per hour
// deductions = late arrival + absence + wrong project
// net        = gross - deductions        (all rounded to 2 decimals)
// ==========================================
export const computeWage = ({ hours, rate, late, absence, wrong_project }) => {
    const gross      = round2(hours * rate);
    const deductions = round2(late + absence + wrong_project);
    return { gross, deductions, net: round2(gross - deductions) };
};
